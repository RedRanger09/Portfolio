# CMS Design

> Companion to [`domain-model.md`](./domain-model.md) and
> [`database-design.md`](./database-design.md). This document answers the
> product-shaped question those two don't: **what does a human actually
> click on, in the admin dashboard, to change what?**

## 1. Philosophy: Content vs. Configuration vs. Code

Three different things currently blur together in "stuff that describes the
site," and this platform keeps them deliberately separate:

| Tier | Definition | Where it lives | Who changes it | Example |
|---|---|---|---|---|
| **Content** | Editorial material with its own identity, lifecycle, and (usually) a draft/publish cycle. | Database tables (`domain-model.md`) | Admin/Editor, via the dashboard, without a deploy | A `Project`, a `BlogPost`, a `Certificate` |
| **Configuration** | Site-wide settings and singleton section copy — not "an item in a list," but "the one true value of this setting." | Database, but a small, fixed number of singleton tables/rows | Admin/Owner, via a Settings module, without a deploy | `SiteSettings.siteName`, `HeroContent.title`, a `FeatureFlag` |
| **Code** | Structural/behavioral decisions that require engineering judgment to change safely — changing them wrong breaks the site, not just shows wrong text. | Source code (`constants/`, `config/`), requires a deploy | A developer, via a commit | `NAVIGATION_ITEMS` order/structure, `SECTION_THEMES` accent colors, which Server Component renders which route |

### 1.1 The decision framework

For any given field, ask in order:

1. **Does changing it require understanding the codebase to do safely?**
   → **Code.** (e.g. reordering `HOME_SECTION_ORDER` also requires updating
   `NAVIGATION_ITEMS` and matching `<section id>`s — a developer decision,
   not an editorial one, even though it "looks like" content ordering.)
2. **Is there ever more than one of it, with its own lifecycle (created,
   edited, published, archived, deleted independently of everything else)?**
   → **Content.** (Projects, Blog posts — many instances, each with its own history.)
3. **Is it exactly one thing, site-wide, that an Admin should be able to
   edit without a deploy, but that doesn't need drafts/versions/its own
   list view?** → **Configuration.** (Site name, Hero copy, a feature toggle.)
4. **Otherwise** → it's probably Code, or you've found a genuine edge case —
   see §1.2.

### 1.2 Worked examples (the genuinely non-obvious ones)

- **Navigation menu (`NAVIGATION_ITEMS`)** → **stays Code.** Tempting to
  make this admin-editable ("let me reorder the navbar!"), but every nav
  item's `href` must match a real `<section id>` or route that exists in
  the code — an admin adding a nav item pointing at a route that doesn't
  exist produces a broken link with no compiler or type system to catch it.
  Revisit only if there's a concrete, recurring need to change the nav
  without a deploy — not designed preemptively.
- **`ContactChannel` (GitHub/LinkedIn/Email/Location cards)** →
  **Content-shaped, but Configuration-tiered.** There are "many" of them,
  but they don't have an independent lifecycle worth a draft/publish
  workflow — they're really just "Settings, but shaped like a small list."
  Modeled as its own table (§3.3) rather than a `SiteSettings` JSON column,
  specifically so the admin gets a clean list-editing UI, but it lives in
  the **Settings** module, not a standalone "Contact Channels" module in the
  main sidebar nav.
- **`SkillCategory` / `SkillEntry`** → **Content**, not Configuration,
  despite feeling "structural." Reasoning: the specific set of skill
  categories and entries *is* editorial material that changes as Akshay's
  skills grow — it has the same "add/edit/reorder/remove instances" shape
  as Projects, just smaller. It gets its own admin module (§4).
- **`Category` (Project categories like "AI/ML", "Web")** → **Content**,
  small and slow-changing, but still genuinely a growing list an admin adds
  to over time, not a fixed enum.

## 2. What's editable, at a glance

| Editable via Admin Dashboard | Fixed in code |
|---|---|
| Every Project, Certificate, Skill, Education/Experience/Journey entry | Which sections exist on the home page, and their order |
| Blog posts, Publications, Research projects | Section accent-color theme mapping |
| Hero/About singleton copy | Route structure (`app/`) |
| Site name, SEO defaults, contact email | RBAC permission *keys* (the catalog of what's checkable — see `database-design.md §5`) |
| Feature flags (on/off) | The Publishable/Versionable/Auditable *mechanics* themselves |
| Contact channel cards, their order/visibility | AI prompt *mechanics* (the retrieval pipeline) — but the prompt *text* itself is editable (`PromptTemplate`) |
| Media library (all uploaded assets) | Cloudinary/Clerk/Resend provider selection |
| User roles and permission grants (Owner only) | The permission catalog's structure |

## 3. Configuration domain design

### 3.1 `SiteSettings` — one singleton row

A single row, enforced by application logic (the admin Settings page always
`upsert`s the one known row rather than allowing creation of a second).
Holds identity/SEO defaults that used to live in `config/site.config.ts`'s
`SITE` object: `siteName`, `siteUrl`, `defaultSeoTitle`,
`defaultSeoDescription`, `defaultOgImageId`, `contactEmail`. `SITE` becomes
the **fallback/seed**, not the runtime source, once this ships (mirroring
how every `data.ts` static array becomes seed data — `system-overview.md §1.2`).

### 3.2 `FeatureFlag` — a growing key/value table, not columns

Deliberately a table (`key`, `value`, `description`), not more columns on
`SiteSettings`, because flags will be added far more often than
`SiteSettings`' well-known fields change, and a table needs no migration to
add a row. Examples expected over time: `enableBlog`, `enableAiAssistant`,
`enableAnalytics`, `enableResumeGenerator`, `maintenanceMode`.

### 3.3 `ContactChannel` — Settings-tier list

Lives in the Settings module's UI (a sub-tab, "Contact Channels"), backed
by its own table for clean list semantics (§1.2), but conceptually
Configuration, not a main-nav Content module — there's rarely more than
4–6 of these, and they don't need a Publishable lifecycle.

### 3.4 `HeroContent` / `AboutContent` — singleton content

Unlike `SiteSettings` (pure configuration), these hold genuine editorial
copy (Hero's headline, About's story paragraphs) — but there's exactly one
Hero and one About section, so they don't need a list view, a slug, or
independent creation. Modeled as singleton tables (same "exactly one row"
discipline as `SiteSettings`) but marked **Versionable** (unlike
`SiteSettings`) because editorial copy changes are exactly the kind of edit
someone might want to revert — a typo fix to `siteUrl` isn't.

## 4. Admin Dashboard modules

Each module below: purpose, primary entities, and the operations it exposes
beyond plain CRUD.

| Module | Purpose | Entities | Notable operations |
|---|---|---|---|
| **Dashboard (home)** | At-a-glance system health: recent messages, draft content awaiting publish, recent visitor trend, AI conversation volume. | Reads across most contexts | — (read-only landing page) |
| **Projects** | Manage showcased projects. | `Project`, `ProjectTechnology`, `ProjectMetric`, `ProjectLink`, `Category`, `Technology`, `Tag` | Draft/Publish/Archive, reorder (`pinnedOrder`), gallery management (upload/reorder/delete via Media Library picker), "mark as Featured" (exactly one at a time — mirrors today's `getFeaturedProject()`), version history/restore |
| **Skills** | Manage skill categories and entries. | `SkillCategory`, `SkillEntry`, `Technology` | Reorder categories and entries, create a new `Technology` inline while adding a skill (avoids a context-switch to a separate "Technologies" screen) |
| **Education & Experience** | Manage academic history, work history, and the learning-journey timeline. | `Education`, `WorkExperience`, `JourneyMilestone` | Mark a `JourneyMilestone` as "Current" (exactly one at a time), reorder |
| **Certificates** | Manage certifications. | `Certificate`, `Issuer` | Create a new `Issuer` inline, upload certificate image via Media Library picker |
| **Blog** | Manage blog posts. | `BlogPost`, `BlogCategory`, `Tag` | Draft/Publish/Archive, rich-text/MDX editing, version history/restore, reading-time auto-calculation |
| **Research** | Manage publications and research projects. | `Publication`, `ResearchProject`, `Author` | Link a `ResearchProject` to an existing `Project`, manage ordered co-author list |
| **Resume** | Manage resume versions. | `ResumeVersion`, `Media` | Upload new PDF + preview image, set as Active (exactly one at a time), view download stats (via `Download`) |
| **Media Library** | Central view of every uploaded asset, regardless of what references it. | `Media`, `MediaAttachment` | Upload (proxies to Cloudinary), search/filter by type, **"where is this used?"** (reverse-lookup across `MediaAttachment` + all direct-FK slots — the payoff of modeling `Media` as its own entity, `domain-model.md §5`), delete (blocked with a clear error if still in use anywhere) |
| **Messages** | Inbox for `ContactMessage`. | `ContactMessage` | Mark read/replied/archived, reply-via-email link (`mailto:`, or a future Resend-backed in-app reply) |
| **Analytics** | Visitor/traffic insight. | `Visitor`, `PageView`, `Event`, `Download` | Top pages, referrer breakdown, resume download count, (later) AI conversation volume trend |
| **AI Assistant** | Manage the chatbot's knowledge and behavior. | `KnowledgeSource`, `Embedding`, `Conversation`, `Message`, `PromptTemplate` | Manual "Reindex now," add a `MANUAL` knowledge source (a freeform FAQ fact not tied to any content row), edit/version the active `PromptTemplate`, browse past conversations for quality review |
| **Users & Roles** | Manage who has admin access and what they can do. **Owner-only.** | `User`, `Role`, `Permission`, `UserRole`, `RolePermission` | Invite a collaborator (creates the local `User` row on their first Clerk sign-in via webhook, pending role assignment), assign/revoke roles, view a user's effective permissions |
| **Audit Log** | System-wide change history. | `AuditLog`, `ContentVersion` | Filter by entity type/actor/date range, view before/after diffs, restore a `ContentVersion` |
| **Settings** | Site identity, feature flags, contact channels. | `SiteSettings`, `FeatureFlag`, `ContactChannel`, `HeroContent`, `AboutContent` | Toggle flags, edit singleton content with the same version-history affordance as Blog/Projects |

### 4.1 Sidebar information architecture (proposed)

```
Dashboard
─────────
Content
  Projects
  Skills
  Education & Experience
  Certificates
  Blog
  Research
  Resume
─────────
Media Library
Messages
─────────
Analytics
AI Assistant
─────────
Users & Roles      (Owner only)
Audit Log
Settings
```

Grouping mirrors the bounded contexts in `domain-model.md §2` — "Content"
groups everything Publishable/Versionable that renders on the public site;
everything below the second divider is operational tooling rather than
editorial content.

## 5. Draft/Publish & review workflow — UX implications

Building on the state machine in `database-design.md §3`:

- Every Content module's list view defaults to showing **all** statuses
  (Draft/Published/Archived), with a status filter and a clear visual badge
  per row — an admin should never lose track of "wait, did I ever publish
  that?"
- The editor view for any Publishable entity has two distinct actions:
  **Save** (writes the current state, stays in whatever status it was —
  this is what an Editor's "Save Draft" does) and **Publish** (an Admin/Owner
  action, moves `DRAFT → PUBLISHED`, sets `publishedAt` if unset, snapshots
  a `ContentVersion`, and — for content marked as AI-indexable — queues a
  reindex).
- **Editors never see a "Publish" button** (per RBAC, `database-design.md §5.1)
  — they see "Submit for review" instead, which is UX phrasing for the same
  underlying action of leaving the entity in `DRAFT` with an
  `AuditLog`-recorded "submitted" marker, notifying an Admin/Owner.
  (This notification mechanism is a UX detail, not a new entity — it reads
  naturally off `AuditLog` filtered to recent submissions; no separate
  "review queue" table is needed at this scale.)
- **Version history** is a tab on every Versionable entity's editor view,
  listing `ContentVersion` rows newest-first with a diff summary and a
  one-click "Restore this version" (which itself performs a normal
  save — creating a *new* `ContentVersion`, never mutating history).

## 6. Editorial consistency: shared admin UI patterns

To avoid each of the eleven Content modules re-inventing its own list/editor
shell, three UI patterns are shared across all of them (a UI-layer decision,
not a schema one, but documented here since it's what makes the CMS feel
coherent rather than like eleven different mini-apps):

1. **`<ContentStatusBadge status={...} />`** — the same Draft/Published/Archived
   pill, same colors, everywhere.
2. **`<ContentListShell />`** — table/grid + status filter + search + "New"
   button, parameterized per module (columns differ; the shell doesn't).
3. **`<VersionHistoryPanel entityType={...} entityId={...} />`** — reads
   `ContentVersion` generically; every Versionable module gets this for free
   just by being Versionable, with zero module-specific code.

This is the CMS-layer equivalent of the Publishable/Versionable/Auditable
schema patterns in `database-design.md §2` — the same "define the shape
once, opt in everywhere" discipline applied to the admin UI instead of the
database.
