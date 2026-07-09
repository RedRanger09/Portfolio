# Database Design

> Companion to [`domain-model.md`](./domain-model.md). That document defines
> *what* the entities and relationships are; this document defines *how*
> they're implemented as schema — normalization decisions, the six
> cross-cutting patterns every entity opts into, and the specific schema
> design for RBAC, analytics, media, and AI. Still no SQL or Prisma syntax —
> this is schema *design*, described precisely enough that writing the
> actual `schema.prisma` in Phase 5 is a transcription exercise, not a design one.

## 1. Normalization strategy

**Baseline: third normal form (3NF).** Every entity in `domain-model.md`
was designed so that non-key attributes depend only on the entity's key —
`Certificate.provider` was already extracted to `Issuer` for this reason
(today's static data even had `providerLogo` duplicated per certificate;
the schema fixes that at the source). The same reasoning produced
`Technology` as one shared entity instead of duplicated `SkillItem.logo` /
`techStack: string[]` shapes (see `domain-model.md §4.1`).

### 1.1 What's normalized

- **Technology, Category, Issuer, Author, Tag** — every "this concept
  appears in more than one place" entity is extracted once, referenced by
  ID everywhere. This is the highest-leverage normalization in the schema:
  it's what makes "rename a technology" or "merge two duplicate tags" a
  one-row operation instead of a data migration.
- **RBAC (User/Role/Permission)** — fully normalized via join tables
  (§5below), never a `user.role: string` column — a string column can't
  express "this role grants these five permissions" without duplicating
  that list on every user row.
- **Media** — one `Media` row per uploaded file, regardless of how many
  entities reference it (in principle; in practice most media is
  single-use, but the schema doesn't assume that).

### 1.2 What's intentionally denormalized, and why

Denormalization here is always a **named, deliberate** tradeoff, never an
oversight:

| Denormalized field | Lives on | Why |
|---|---|---|
| `User.email` | `User` | Duplicates Clerk's own record of the email. Needed for admin-dashboard UI (message lists, audit logs) to render a name/email without an external Clerk API call on every request. Kept in sync via the Clerk webhook. |
| `KnowledgeSource.extractedText` | `KnowledgeSource` | Duplicates the plain-text content of a `Project`/`BlogPost`/etc. Necessary because the AI pipeline needs a stable, chunkable text snapshot decoupled from the source's live rich-text/JSX shape — re-deriving it on every chat query would be slow and coupling the AI pipeline to every content type's exact rendering logic. Explicitly re-synced whenever the source is published (see `future-roadmap.md §1.4`), so staleness is bounded and self-healing. |
| `Project.pinnedOrder` / any `*.order` column | Several (`Orderable` pattern) | Manual curation order is not derivable from `createdAt` or alphabetical sort — it's genuinely primary data, not a cache, so this isn't "denormalization" in the harmful sense, but it's listed here because it's the most common extra column in the schema. |
| `ContactMessage.ipHash` | `ContactMessage` | A one-way hash, not the raw IP — kept for basic spam/abuse pattern detection without storing PII. |
| Content counts (e.g. a future `Project.viewCount`) | *(not yet added)* | Explicitly deferred. If the admin dashboard needs "views per project," it's computed from `PageView`/`Event` at read time (a `GROUP BY`) until/unless that query is measurably too slow — only then does a cached counter column get added, with a documented invalidation strategy. Adding it preemptively risks a silently stale number. |

**Guiding rule:** denormalize only for (a) a genuine cross-system boundary
(Clerk ↔ local `User`), (b) a genuine performance/decoupling need with a
defined resync strategy (`KnowledgeSource.extractedText`), or (c) data that
was never derivable in the first place (`order` columns). Never denormalize
"to save a join" preemptively — Postgres joins on indexed foreign keys are
cheap at this platform's scale.

## 2. Cross-cutting schema patterns

Six shapes repeat across many entities in `domain-model.md`. Defining each
once here — and referencing them by name everywhere else — is what keeps
this a coherent *system* instead of fifty bespoke tables.

### 2.1 Taggable pattern

```
Tag            { id, name, slug }
TaggedItem     { id, tagId → Tag, taggableType (enum), taggableId }
```

`taggableType` + `taggableId` is a **polymorphic foreign key** — Postgres
has no native "foreign key to one of several tables" construct, so
referential integrity for this pattern is enforced at the application layer
(Prisma) rather than a DB constraint. This is a conscious, standard tradeoff
for polymorphic associations: the alternative (a nullable FK column per
possible target type — `projectId?`, `blogPostId?`, `publicationId?` all on
one row) is more DB-enforceable but means every new taggable type is a
schema migration. Given tagging is genuinely cross-cutting and low-risk
(worst case of a dangling `TaggedItem` is an invisible, harmless orphan
row, cleaned up by the same reconciliation job mentioned in §9), the
flexibility wins.

### 2.2 Media Attachment pattern

Two different relationships to `Media`, chosen per use case:

- **Direct FK** (`Project.featuredImageId → Media.id`, nullable) — for
  **singleton slots**: exactly one image, referential integrity matters,
  and the query is always "get this project's one featured image," never
  "get all featured images across everything." Simple, DB-enforced, fast.
- **`MediaAttachment` join** (`mediaId`, `attachableType`, `attachableId`,
  `role`, `order`) — for **one-to-many slots**: a Project's gallery, a Blog
  post's inline images. Same polymorphic tradeoff as Taggable, accepted for
  the same reason: gallery attachment counts and content types will grow
  over the platform's life, and a join-table model absorbs that growth with
  zero migrations.

**Rule of thumb applied throughout this schema:** *singleton relationship →
direct FK; one-to-many-and-growing relationship → polymorphic join.* This
rule is why `Certificate.imageId` is a direct FK but `Project`'s gallery is
a `MediaAttachment` join, even though both are "a Media on a Content entity."

### 2.3 Versionable pattern (`ContentVersion`)

```
ContentVersion {
  id, versionableType (enum), versionableId,
  versionNumber, snapshotJson, changeSummary?,
  createdById → User, createdAt
}
```

Every entity marked **Versionable** in `domain-model.md` (`Project`,
`BlogPost`, `Publication`, `HeroContent`, `AboutContent`, `PromptTemplate`)
gets a full JSON snapshot written to `ContentVersion` on every save that
changes published content — not on every keystroke, but on every
"Save"/"Publish" action in the admin dashboard. This is what makes "revert
to yesterday's version of this project" a read-and-restore of one JSON blob,
no matter how the entity's own schema evolves over time (a `snapshotJson`
from two schema versions ago still deserializes as "whatever it was then,"
which is exactly what a history feature needs — it's a record of the past,
not a live foreign-keyed structure).

`ResumeVersion` is deliberately **not** built on this generic pattern — see
§7.

### 2.4 Auditable pattern (`AuditLog` + timestamp columns)

Two distinct mechanisms, often confused, kept separate on purpose:

1. **Timestamp columns** (`createdAt`, `updatedAt`, `deletedAt`) — present
   on every mutable table, always. Cheap, always-on, no write amplification.
2. **`AuditLog` rows** — a system-wide append-only log, written by a Prisma
   middleware (Phase 5 implementation detail, not designed further here)
   that intercepts every create/update/delete across *every* table and
   records:

```
AuditLog {
  id, actorId → User, action (CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH),
  entityType (enum), entityId, beforeJson?, afterJson?,
  ipAddress?, occurredAt
}
```

`AuditLog` answers "who changed what, when, from what, to what" —
system-wide, for every table, including ones that aren't individually
Versionable (e.g. a `Category` rename, a `Role` permission change). This is
strictly broader but shallower than `ContentVersion`: `AuditLog` is a
change *record* (good for a security/compliance trail); `ContentVersion` is
a content *snapshot* (good for a "restore this version" UX). A Project edit
produces one of each.

### 2.5 Orderable pattern

A plain integer `order` (or `sortOrder`) column, present wherever admin
curation order matters and isn't derivable from another field
(`ProjectTechnology.order`, `SkillCategory.order`, `GalleryImage`/
`MediaAttachment.order`, `ContactChannel.order`). Enables drag-to-reorder in
the admin UI (re-writing `order` on the affected rows) without ever needing
a linked-list or fractional-indexing scheme — the row counts here are small
(tens, not thousands), so a full re-write on reorder is trivially cheap.

### 2.6 Publishable pattern

```
status: DRAFT | PUBLISHED | ARCHIVED
publishedAt: DateTime?
```

On `Project`, `BlogPost`, `Publication`, `ResearchProject`. See §3 for the
full draft/publish/archive lifecycle this enables.

### 2.7 Soft delete pattern

`deletedAt: DateTime?` on every content table (everything in the Portfolio
Content, Blog & Research, and Media contexts). See §4.

## 3. Draft/Publish workflow

Every **Publishable** entity moves through exactly three states:

```
   create           edit freely             edit still allowed
     │                   │                          │
     ▼                   ▼                          ▼
  ┌───────┐   publish  ┌───────────┐   archive   ┌──────────┐
  │ DRAFT │ ─────────► │ PUBLISHED │ ──────────► │ ARCHIVED │
  └───────┘            └───────────┘             └──────────┘
     ▲                       │
     └───── unpublish ───────┘
```

- **DRAFT** — visible only in the admin dashboard. Never appears on the
  public site, never indexed for AI search (§9).
- **PUBLISHED** — `publishedAt` is set (once, on the *first* publish —
  re-publishing an edit doesn't reset it, preserving "originally published"
  semantics separately from `updatedAt`). Visible publicly. Triggers the AI
  reindex job (§9, `future-roadmap.md §1.4`).
  Writes a `ContentVersion` snapshot.
- **ARCHIVED** — removed from public listing pages but its permalink still
  resolves (for Blog posts especially — dead links are worse than an
  "archived" banner). Excluded from AI indexing on the next reindex pass.

An entity can move `DRAFT → PUBLISHED → DRAFT` (unpublish) freely; moving to
`ARCHIVED` is treated as a more deliberate, less-reversible action in the
admin UX (confirmation required) but remains technically reversible by an
Owner/Admin.

## 4. Soft delete & recovery

No content row is ever `DELETE`d by an admin action — `deletedAt` is set
instead, and every Prisma query in `features/*/data.ts` filters
`WHERE deletedAt IS NULL` by default (a Prisma [client extension /
middleware], applied globally, documented here, implemented in Phase 5).

- **Recovery** — the admin dashboard's Trash view (per content module) lists
  soft-deleted rows and offers "Restore" (clear `deletedAt`) or "Delete
  forever" (a genuine, irreversible `DELETE`, Owner-only, requires typed
  confirmation).
- **Retention** — soft-deleted rows older than a defined window (proposed:
  90 days) are eligible for a periodic hard-delete job — deferred design,
  flagged here so it isn't forgotten (see `future-roadmap.md §6`, "decisions
  needed before Phase 5" list carries this forward).
- **Cascade behavior** — soft-deleting a `Project` does **not** cascade
  soft-delete to its `ProjectMetric`/`ProjectLink`/`ProjectTechnology` rows;
  those are read through the parent and become unreachable the moment the
  parent is filtered out, without needing their own `deletedAt` bookkeeping.
  Hard-deleting a `Project` (after the retention window) *does* cascade —
  standard `ON DELETE CASCADE` on those child tables, since they have no
  independent meaning without their parent.

## 5. RBAC schema

```
Role           { id, name, description }
Permission     { id, key ("project.publish"), resource, description }
RolePermission { roleId → Role, permissionId → Permission }
User           { id, clerkId, email, name, isOwner, ... }
UserRole       { userId → User, roleId → Role }
```

### 5.1 Default roles and their permission bundles

| Role | Can | Cannot |
|---|---|---|
| **Owner** | Everything, including user/role management. Exactly one Owner (Akshay); enforced at the application layer (`User.isOwner`, not itself deletable/demotable by anyone, including other Owners if the schema ever allows more than one). | — |
| **Admin** | Full CRUD + publish/unpublish/archive on all content, media, settings. | Manage Users/Roles/Permissions. |
| **Editor** | Create/edit any content, upload media. | Publish (can only submit to `DRAFT`, an Admin/Owner promotes to `PUBLISHED`), delete, manage settings. |
| **Viewer** | Read-only access to the admin dashboard (drafts, analytics, messages). | Any mutation. |

### 5.2 Why permissions are granular strings, not a role hierarchy

`Permission.key` values like `project.create`, `project.publish`,
`blog.delete`, `settings.update`, `user.manage` are checked individually
(`hasPermission(user, 'project.publish')`) rather than assuming "Admin > Editor
> Viewer" is a strict hierarchy. This matters the day a **Viewer-plus**
role is needed (e.g. a collaborator who should see analytics but not
drafts) — it's a new `Role` row with a hand-picked `RolePermission` set, not
a schema change or a new hardcoded tier.

### 5.3 Where permission checks live

- **Middleware** (`middleware.ts`) — coarse-grained: "is this user logged in
  and does the local `User` row exist at all" gates the entire `(admin)`
  route group.
- **Per-action checks** (inside each Server Action) — fine-grained: `create
  Project` checks `project.create`; `publish Project` checks
  `project.publish`. This two-layer approach means a UI bug that renders a
  "Publish" button for an Editor fails safe — the Server Action rejects it
  server-side regardless of what the client rendered.

## 6. Analytics schema

```
Visitor  { id, anonymousId (cookie-based, unique), firstSeenAt, lastSeenAt,
           country?, deviceType?, referrer? }
PageView { id, visitorId → Visitor, path, viewedAt, durationSeconds? }
Event    { id, visitorId → Visitor, eventType, payload (jsonb), occurredAt }
Download { id, visitorId → Visitor, mediaId? → Media, resumeVersionId? → ResumeVersion, downloadedAt }
```

### 6.1 Privacy posture

- `anonymousId` is a random, first-party cookie value — never an email,
  never tied to a `User`, never a raw IP. `Visitor` rows contain no PII by
  design, which keeps this subsystem outside the scope of most data-privacy
  obligations that would otherwise apply to a system storing personal data.
- `Event.payload` is `jsonb` specifically so new event shapes (a new button,
  a new interaction) never require a migration — the tradeoff (no schema
  validation on the payload shape) is accepted because these rows are
  write-once, read-in-aggregate (dashboards, not per-row business logic
  that would need strict shape guarantees).

### 6.2 Retention & rollups

Raw `PageView`/`Event` rows are useful for debugging and short-term trend
lines but not meant to be queried raw forever. A deferred (not designed in
this phase) rollup job would periodically aggregate them into daily/weekly
summary rows for dashboard charts, after which raw rows past a retention
window (proposed: 6–12 months) can be pruned. Flagged forward to
`future-roadmap.md §6` as a pre-Phase-5 decision (retention window length).

## 7. Why `ResumeVersion` isn't built on the generic `ContentVersion` pattern

`ContentVersion` snapshots a JSON representation of structured content — it
fits `Project`, `BlogPost`, and anything else whose "content" is data this
schema itself models. A resume is fundamentally a **file** (a PDF a human
designed elsewhere), not structured content this schema can meaningfully
diff or snapshot as JSON. `ResumeVersion` is therefore its own small,
purpose-built table (`fileMediaId`, `previewImageMediaId`, `label`,
`isActive`, `changeSummary`, `effectiveDate`) rather than "a `Media` row plus
a generic `ContentVersion` wrapper" — the extra fields (`isActive`,
`effectiveDate`) are resume-specific concepts a generic version table
shouldn't need to know about.

## 8. The public write path: `ContactMessage`

This is the **one and only** table the public (unauthenticated) side of the
application ever writes to. Everything else flows through Clerk-gated
Server Actions in the admin dashboard. Because of that, `ContactMessage`
gets deliberately extra scrutiny:

- **No foreign key requires trust** — `ContactMessage` has no relationship
  to `User` or anything else that a malicious submission could corrupt by
  reference.
- **Validated and rate-limited at the Route Handler**, before it ever
  reaches Prisma (schema validation via a runtime validator, and a basic
  per-IP rate limit — exact mechanism is a Phase 5+ implementation detail,
  flagged here as a requirement, not designed further).
- **`ipHash`, not `ip`** — see §1.2.
- **Read/write asymmetry**: the public Route Handler can only `INSERT`;
  reading, updating `status`, and deleting messages happens exclusively
  through the authenticated admin Messages module. This asymmetry is worth
  stating explicitly because it's the platform's only genuinely
  security-sensitive boundary — every other table is either fully public
  (read-only) or fully admin-gated (read/write).

## 9. AI / embeddings schema

```
KnowledgeSource {
  id, sourceType (PROJECT | BLOG_POST | PUBLICATION | RESUME | MANUAL),
  sourceId?, title, extractedText, lastIndexedAt, deletedAt?
}
Embedding {
  id, knowledgeSourceId → KnowledgeSource, chunkIndex, chunkText,
  vector (pgvector, dimension per model), model, createdAt
}
```

### 9.1 Why `Embedding.model` exists on every row

Embedding models change over time (a provider ships a better/cheaper
model), and different models produce vectors of different dimensions that
**cannot be compared to each other**. Storing `model` on every `Embedding`
row means:

- Switching models is additive (generate new rows for the new model; don't
  overwrite/delete the old ones until confident) rather than a risky,
  all-at-once cutover.
- A `FeatureFlag` (`activeEmbeddingModel`) tells the retrieval query which
  model's rows to search against, so a rollback is a flag flip, not a data
  operation.

### 9.2 Indexing

- `Embedding.vector` gets an HNSW (or IVFFlat) index via pgvector — the
  standard approach for approximate nearest-neighbor search at this scale
  (see `system-overview.md §4.7` for why pgvector over a dedicated vector DB).
- `KnowledgeSource.sourceType, sourceId` gets a composite index — the
  reconciliation job (pruning orphaned KnowledgeSources whose source was
  hard-deleted) and the "reindex this specific entity" admin action both
  look it up by that pair.

### 9.3 Referential integrity is intentionally soft here

As noted in `domain-model.md §11`, `KnowledgeSource.sourceId` has no DB-level
foreign key — it's a "soft reference," checked by a periodic reconciliation
job rather than enforced by Postgres. This is the one deliberate departure
from "normalize and enforce everything" in this schema, justified because
the alternative (a hard FK from `KnowledgeSource` into one of four possible
tables) isn't expressible as a single Postgres constraint anyway (same
polymorphic-FK limitation as §2.1), and the failure mode of a dangling
reference here is low-stakes (a chatbot occasionally citing a source that
no longer resolves to a live page — caught and pruned, not a data
corruption risk).

## 10. Indexing & query-pattern notes (conceptual)

General indexing principles this schema follows, applied per-table in Phase 5:

- Every foreign key column gets an index (Prisma does this by default for
  relation fields).
- Every `slug` column (`Project.slug`, `BlogPost.slug`, `Category.slug`, …)
  is `UNIQUE` and indexed — these are the public site's primary lookup key
  (`/projects/[slug]`, `/blog/[slug]`).
- `status` + `publishedAt` get a composite index on every Publishable
  table — the public site's most common query is "published items, newest
  first."
- `deletedAt` gets an index (partial index `WHERE deletedAt IS NULL` is
  the ideal form) since it's filtered on almost every query, everywhere.
- `AuditLog` and `PageView`/`Event` get indexes on `(entityType, entityId)`
  and `(visitorId, occurredAt)` respectively — these tables are written far
  more than they're read, and reads are always scoped, never full-table.

## 11. Scalability notes specific to the database

- **Connection pooling is a required infrastructure decision, not
  optional.** Serverless deployment (Vercel) means many short-lived
  function invocations, each wanting a DB connection — without pooling
  (PgBouncer, or a provider's built-in pooling like Neon/Supabase), Postgres
  will exhaust its connection limit under even modest concurrent traffic.
  This must be decided *before* Phase 5 ships to production — flagged again
  in `future-roadmap.md §6`.
- **Partitioning** — not needed at launch for any table. If `PageView`,
  `Event`, or `AuditLog` ever grow into the tens of millions of rows (a
  multi-year traffic outcome, not a near-term one), time-based partitioning
  (by month) is the standard Postgres answer and requires no application
  code changes, only a DB-level migration.
- **Read replicas** — not needed at launch (single-writer, low write
  volume, read volume well within a single Postgres instance's capacity for
  a personal platform's realistic traffic). Revisit only if p95 read
  latency on the public site becomes measurably DB-bound.
- **Caching** — Next.js's own data cache / ISR is the first lever to pull
  for public-page read load, before ever reaching for a Redis layer — most
  portfolio/blog pages change on the order of "once a day at most," which
  ISR handles natively with zero new infrastructure.
