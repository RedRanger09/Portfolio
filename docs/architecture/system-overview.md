# System Overview

> **Status:** Architecture design only. No Prisma schema, SQL, APIs, or
> dependencies exist yet as a result of this document set. Everything here
> describes the target system that Phases 5+ will implement incrementally.
>
> **Document set:**
>
> 1. `system-overview.md` (this file) — vision, subsystems, technology
>    decisions, folder evolution.
> 2. [`domain-model.md`](./domain-model.md) — every entity, every
>    relationship, ER diagrams.
> 3. [`database-design.md`](./database-design.md) — normalization,
>    cross-cutting schema patterns (audit, versioning, RBAC, media, AI).
> 4. [`cms-design.md`](./cms-design.md) — what's editable vs. configuration,
>    Admin Dashboard module design.
> 5. [`future-roadmap.md`](./future-roadmap.md) — AI/RAG architecture, GitHub
>    integration, resume generator, phased delivery plan, final review.
>
> This set complements, but does not replace, the root [`ARCHITECTURE.md`](../../ARCHITECTURE.md),
> which remains authoritative for the *frontend* folder structure and
> rendering strategy established in Phases 1–3. This set covers everything
> `ARCHITECTURE.md` explicitly deferred: the database, the admin surface, and
> every system that reads or writes it.

## 1. Vision: Portfolio → Portfolio Platform

The project stops being "a Next.js site with static data files" and becomes
a **platform**: one PostgreSQL database, one Prisma schema, and two
consumers of it —

- a **Public Portfolio** (today's site: Hero, About, Projects, Blog,
  Research, Resume, Contact — all read-only, all Server Components), and
- a **Private Admin Dashboard** (a new, authenticated surface for creating,
  editing, publishing, and observing everything the public site shows, plus
  operational tooling: messages, analytics, AI assistant management).

Both consumers share one data layer. The public site never talks to the
database directly for writes; the admin dashboard is the only writer. This
single-writer principle is the foundation the rest of this document builds
on — it's what keeps a five-year-old version of this platform reasoned-about
in the same terms as day one.

### 1.1 Principles carried over from the frontend architecture

`ARCHITECTURE.md` established four rules for the frontend. Three carry
forward unchanged; the fourth is the one this whole initiative exists to
fulfill:

1. **Colocate by domain, not by file type.** — still true. Each feature's
   `data.ts` stays the seam; only what's *behind* the seam changes.
2. **One-directional dependencies** (`app/` → `features/` → `shared/`) —
   still true, and extended: `features/*/data.ts` → `lib/prisma.ts` is the
   only new arrow, and it only points one way.
3. **Don't build structure you can't fill yet** — still true, which is why
   this document explicitly separates "design now" from "build in Phase 5+."
4. *("The data layer is the only seam that changes when the backend
   arrives.")* — **this is the promise Phase 4+ redeems.** Every
   `getProjects()`, `getCertifications()`, `getHeroData()` etc. already
   returns `Promise<T>` from a static array. Phase 5 replaces the array with
   a Prisma call. No component, no type, no import path changes.

### 1.2 New principles this phase introduces

5. **Single writer, many readers.** Only the Admin Dashboard (behind Clerk
   auth) performs writes. The public site performs reads only, directly
   against Postgres via Prisma in Server Components — never through a
   public-facing mutation API.
6. **The database is the source of truth; `data.ts` static arrays become
   seed data.** Nothing conceptually changes about *what* a `Project` is —
   the current `Project` TypeScript interface is close to the final schema
   already, because it was designed data-first from day one.
7. **Every mutable record is auditable, versionable, and soft-deletable by
   default**, not as an afterthought bolted on later. See
   [`database-design.md §2`](./database-design.md#2-cross-cutting-schema-patterns).
8. **AI and analytics are additive subsystems, not core dependencies.** The
   portfolio and CMS must function completely with the AI assistant or
   analytics pipeline disabled. Neither ever sits in the critical path of
   rendering a page or saving a Project.

## 2. System context

```
                              ┌─────────────────────────┐
                              │        Visitors         │
                              │  (public, anonymous)    │
                              └────────────┬─────────────┘
                                            │ HTTPS
                                            ▼
                    ┌───────────────────────────────────────────┐
                    │              Next.js Application            │
                    │                                             │
                    │   app/(public)/*        app/(admin)/admin/*  │
                    │   Server Components      Server Components   │
                    │   (read-only)            + Server Actions    │
                    │        │                        │            │
                    │        └───────────┬────────────┘            │
                    │                    ▼                         │
                    │            src/features/*/data.ts            │
                    │           (the one seam — §1.1.4)            │
                    │                    │                         │
                    │                    ▼                         │
                    │              lib/prisma.ts                   │
                    └────────┬───────────┬──────────┬──────────────┘
                             │           │          │
                 ┌───────────▼──┐  ┌─────▼─────┐  ┌─▼─────────────┐
                 │ PostgreSQL   │  │  Clerk     │  │  Cloudinary    │
                 │ (+ pgvector) │  │  (auth)    │  │  (media)       │
                 └──────────────┘  └────────────┘  └────────────────┘
                             ▲
              ┌──────────────┼───────────────────┐
              │              │                   │
      ┌───────▼──────┐ ┌─────▼──────┐   ┌────────▼────────┐
      │ AI subsystem │ │ Analytics  │   │ Background jobs  │
      │ (embeddings, │ │ ingestion  │   │ (reindex on       │
      │  chat)       │ │ (PageView) │   │  publish, rollups)│
      └──────────────┘ └────────────┘   └───────────────────┘
```

One Next.js codebase, one deployment, one database. The `(public)` and
`(admin)` route groups are a *routing* boundary (different layouts,
different middleware), not a *deployment* boundary — see
[§4.5](#45-admin-architecture-same-app-vs-separate-app) for why.

## 3. Major subsystems

| Subsystem | Responsibility | Primary entities |
|---|---|---|
| **Portfolio Content** | Projects, Skills, Education, Experience, Journey, Certifications | `Project`, `Technology`, `Category`, `SkillCategory`, `Education`, `WorkExperience`, `JourneyMilestone`, `Certificate`, `Issuer` |
| **Blog & Research** | Long-form editorial content | `BlogPost`, `BlogCategory`, `Publication`, `ResearchProject`, `Author` |
| **Media** | Every uploaded asset and where it's used | `Media`, `MediaAttachment` |
| **Resume** | Versioned resume files, future generated resume | `ResumeVersion`, `ResumeSection` |
| **Contact & Engagement** | Inbound messages, public contact channels | `ContactMessage`, `ContactChannel` |
| **Analytics** | Anonymous visitor and traffic insight | `Visitor`, `PageView`, `Event`, `Download` |
| **AI & Search** | Embeddings, semantic search, chatbot | `KnowledgeSource`, `Embedding`, `Conversation`, `Message`, `PromptTemplate` |
| **Identity & Access** | Who can log into the admin, and what they can do | `User`, `Role`, `Permission` |
| **Audit & Governance** | Change history, versioning, recovery | `AuditLog`, `ContentVersion` |
| **Configuration** | Site-wide settings, feature toggles, singleton section content | `SiteSettings`, `FeatureFlag`, `HeroContent`, `AboutContent` |

Full entity catalog, attributes, and relationships: [`domain-model.md`](./domain-model.md).

## 4. Technology decisions

Every decision below follows the same format: **Choice** — the alternatives
considered, the tradeoff, why this choice wins for *this* platform, and what
it means five years out.

### 4.1 Database engine: PostgreSQL

- **Alternatives:** MongoDB (document store), SQLite (file-based), MySQL.
- **Tradeoff:** Postgres is relationally stricter (schema migrations
  required for shape changes) vs. MongoDB's schema flexibility; Postgres is
  a server process vs. SQLite's zero-ops file.
- **Reasoning:** The domain is deeply relational (Project↔Technology↔Category,
  RBAC joins, polymorphic attachments) — exactly what a relational database
  is for. Postgres additionally gives us **pgvector** (AI embeddings),
  **full-text search** (`tsvector`, good enough for blog/project search at
  this scale), and **JSON columns** (`jsonb`) for the few places semi-structured
  data genuinely helps (audit diffs, feature flags) — one engine covers every
  current and future need without adding a second datastore.
- **Long-term impact:** One connection string, one backup strategy, one
  place to reason about consistency. Every managed Postgres provider (Neon,
  Supabase, RDS, Railway) is a drop-in swap since we own the schema via
  Prisma migrations, not a vendor-specific API.

### 4.2 ORM: Prisma

- **Alternatives:** Drizzle ORM, raw SQL with a query builder (Kysely), no ORM.
- **Tradeoff:** Prisma's generated client is heavier and less "SQL-transparent"
  than Drizzle; Drizzle is lighter but has a smaller ecosystem and less
  mature migration tooling as of today.
- **Reasoning:** Prisma's schema-as-single-source-of-truth model matches
  this project's existing philosophy (`types.ts` per feature is already a
  single source of truth for shape). Prisma Migrate gives reviewable,
  versioned migration files — critical for a project meant to last five
  years across many small changes. Prisma's TypeScript types can be
  re-exported directly as (or mapped to) each feature's existing type, so
  `types.ts` files shrink rather than duplicate.
- **Long-term impact:** `prisma/schema.prisma` becomes the second
  single-source-of-truth document in this repo (after `domain-model.md`,
  which this schema will implement 1:1). Every future entity in this
  document set has a clear destination.

### 4.3 Authentication: Clerk

- **Alternatives:** NextAuth.js / Auth.js, Supabase Auth, Auth0, roll-your-own.
- **Tradeoff:** Clerk is a paid, hosted service (vendor dependency) vs.
  NextAuth's self-hosted, free, more DIY approach.
- **Reasoning:** This was already decided in the original refactor brief and
  is reaffirmed here: Clerk's prebuilt UI (`<SignIn>`, `<UserButton>`),
  middleware-based route protection, and webhook events
  (`user.created`/`user.updated`) remove weeks of auth plumbing for a
  platform with a tiny, trusted user base (the Owner + a handful of future
  Editors/Viewers) — exactly the case Clerk is priced and designed for.
- **Long-term impact:** Clerk is the *authentication* system of record; a
  local `User` table (mirrored via webhook) is the *authorization* system of
  record (roles/permissions — see [§9 of `database-design.md`](./database-design.md#5-rbac-schema)).
  This split means switching auth providers later only requires re-pointing
  the webhook and sign-in UI — the RBAC schema and every permission check in
  the app is provider-agnostic.

### 4.4 Media storage: Cloudinary

- **Alternatives:** AWS S3 + CloudFront, Vercel Blob, local `public/` (today's approach).
- **Tradeoff:** Cloudinary bundles transformation/CDN/storage into one
  billed service vs. S3's cheaper raw storage but DIY transformation
  pipeline (Lambda@Edge / sharp).
- **Reasoning:** This platform needs on-the-fly responsive image variants
  (project screenshots, certificate images, blog cover images) and video
  support (future project demos) without building an image pipeline.
  Cloudinary's free tier comfortably covers a personal platform's traffic.
- **Long-term impact:** The `Media` entity stores a `provider` field
  (`CLOUDINARY | LOCAL | S3`) from day one specifically so a future
  migration off Cloudinary — if traffic or cost ever justifies it — is a
  per-row data migration, not a schema change.

### 4.5 Admin architecture: same app vs. separate app

- **Alternatives:** A fully separate Next.js app (separate repo/deployment)
  for the admin dashboard.
- **Tradeoff:** Separate app = stronger deployment/security isolation, but
  doubles CI/CD, duplicates the design system and Prisma client wiring, and
  requires either a shared package or copy-pasted types.
- **Reasoning:** At this platform's scale (one primary owner, a handful of
  collaborators), the operational overhead of two apps outweighs the
  isolation benefit. A `(admin)` route group with its own `layout.tsx`,
  gated by Clerk middleware on `middleware.ts`, gets the same effective
  isolation (different layout, different auth requirement, different bundle
  via route-based code splitting) with one codebase.
- **Long-term impact:** If the platform ever needs to isolate the admin
  surface (e.g. a compliance requirement, or the admin dashboard becoming
  its own product), the `(admin)` route group is already a clean
  extraction boundary — it owns its own layout, its own Server Actions, and
  imports the same `features/*/data.ts` functions the public site does, so
  splitting it out later is a lift-and-shift, not a rewrite.

### 4.6 API layer: Server Actions + targeted Route Handlers

- **Alternatives:** A full REST or GraphQL API for all reads and writes.
- **Tradeoff:** A formal API adds a stable, versionable contract and
  supports external consumers, at the cost of significant boilerplate for a
  platform with exactly one client (itself).
- **Reasoning:**
  - **Public reads** need no API at all — Server Components call
    `getProjects()` directly, which calls Prisma directly. This is already
    the established pattern; nothing changes.
  - **Admin writes** use **Server Actions** (`'use server'` functions
    colocated with each feature, e.g. `createProject()`, `updateProject()`
    beside `getProjects()`) — type-safe end-to-end, no hand-written fetch
    calls, no separate request/response shape to maintain.
  - **Route Handlers** (`app/api/*`) are reserved for the three cases that
    genuinely need a stable HTTP contract: **webhooks** (Clerk user sync,
    future GitHub sync), the **public contact form** submission endpoint
    (needs to be callable from a plain `<form>` with progressive
    enhancement), and the **AI chat streaming endpoint** (streaming
    responses are Route Handlers' strong suit).
- **Long-term impact:** If a future need arises for a public API (e.g. a
  headless consumer, a mobile app), Route Handlers under `app/api/v1/*` slot
  in beside the existing ones without disturbing Server Actions or Server
  Component reads.

### 4.7 Vector store: pgvector (in the same Postgres instance)

- **Alternatives:** Pinecone, Weaviate, Qdrant (dedicated vector databases).
- **Tradeoff:** Dedicated vector DBs are more optimized for very
  large-scale, high-QPS similarity search, at the cost of a second
  datastore, a second connection string, and cross-database consistency
  concerns (keeping `Embedding` rows in sync with their source `Project`).
- **Reasoning:** This platform's embedding volume (see
  [`future-roadmap.md §1`](./future-roadmap.md#1-ai--rag-architecture)) will
  realistically stay in the thousands of vectors, not millions. pgvector's
  HNSW index handles that scale with room to spare, and keeping embeddings
  in the same database as their source content means a single transaction
  can update a `Project` and its `Embedding` rows together — no eventual
  consistency to reason about.
- **Long-term impact:** If the platform's content volume or query load ever
  genuinely outgrows pgvector (an explicit, measurable trigger — not a
  guess), `Embedding.vector` can be exported to a dedicated vector DB
  without touching `KnowledgeSource`, `Conversation`, or `Message` — the
  vector store is intentionally the most replaceable piece of the AI subsystem.

### 4.8 Search: Postgres full-text search (not Algolia/Meilisearch)

- **Reasoning:** Blog/project/publication counts will be in the hundreds,
  not the millions. Postgres `tsvector` + a GIN index gives "good enough"
  relevance ranking with zero additional infrastructure. Revisit only if
  content volume grows by 100x or relevance quality becomes a real
  complaint — an explicit, deferred decision, not a rejected one.

### 4.9 Background jobs: Vercel Cron + Route Handlers (not a dedicated queue)

- **Alternatives:** Inngest, Trigger.dev, a Redis-backed queue (BullMQ).
- **Reasoning:** The only recurring background work this platform needs
  initially is (a) re-embedding content when it's published, and (b)
  periodic analytics rollups. Both are low-frequency, low-volume, and
  tolerant of running once a day or on-demand from an admin "Reindex"
  button — a scheduled Route Handler hit by Vercel Cron is sufficient and
  adds no new infrastructure.
- **Long-term impact:** If job volume or complexity grows (e.g. the GitHub
  sync pipeline needs retries, backoff, and dead-letter handling), a
  dedicated queue is a self-contained addition — it consumes the same
  Prisma models and doesn't require re-architecting the jobs that already exist.

### 4.10 Analytics: self-hosted tables, not a third-party product (initially)

- **Alternatives:** Vercel Analytics, Plausible, PostHog.
- **Reasoning:** A minimal `Visitor`/`PageView`/`Event` schema (see
  [`database-design.md §6`](./database-design.md#6-analytics-schema)) gives
  full ownership of the data — important if visitor behavior ever feeds the
  AI assistant's context or the admin dashboard's own analytics module. It's
  intentionally isolated (its own bounded context, minimal foreign keys
  pointing *in*) so it can be supplemented or replaced by a third-party
  product later without any other subsystem noticing.

### 4.11 Email: Resend

- Already planned in `config/env.ts` (`RESEND_API_KEY`). Used for the
  contact form's notification email and, later, any admin digest emails
  (new message received, weekly analytics summary). No change from the
  original plan.

## 5. Folder structure evolution

The current structure (see `ARCHITECTURE.md §2`) is deliberately minimal
because there's no backend yet. Here is how it grows, phase by phase (full
phase plan in [`future-roadmap.md §5`](./future-roadmap.md#5-phased-delivery-plan)):

```
src/
├─ app/
│  ├─ (public)/                 ⬅ NEW — wraps today's app/page.tsx, app/blog/, app/research/
│  │  ├─ page.tsx                  (unchanged content, just relocated under the route group)
│  │  ├─ blog/[slug]/page.tsx      ⬅ NEW
│  │  └─ research/[slug]/page.tsx  ⬅ NEW
│  ├─ (admin)/                  ⬅ NEW — gated by middleware.ts
│  │  └─ admin/
│  │     ├─ layout.tsx             Admin shell: sidebar nav, Clerk <UserButton>
│  │     ├─ page.tsx               Dashboard home (recent activity, quick stats)
│  │     ├─ projects/              List/create/edit — Server Components + Server Actions
│  │     ├─ blog/
│  │     ├─ media/                 Media Library module
│  │     ├─ messages/
│  │     ├─ analytics/
│  │     ├─ ai/                    Knowledge source management, conversation review
│  │     ├─ users/                 Role/permission management (Owner-only)
│  │     └─ settings/
│  ├─ api/
│  │  ├─ webhooks/clerk/route.ts   ⬅ NEW — syncs Clerk users to local `User` table
│  │  ├─ webhooks/github/route.ts  ⬅ NEW (future — GitHub integration)
│  │  ├─ contact/route.ts          ⬅ NEW — public contact form submission
│  │  └─ ai/chat/route.ts          ⬅ NEW — streaming chatbot endpoint
│  ├─ layout.tsx                (unchanged)
│  └─ globals.css               (unchanged)
│
├─ features/
│  ├─ portfolio/                (unchanged shape; data.ts bodies swap to Prisma calls)
│  ├─ blog/                     ⬅ NEW — mirrors portfolio/<section> shape exactly
│  ├─ research/                 ⬅ NEW
│  ├─ resume/                   (unchanged; gains ResumeVersion-aware data.ts)
│  ├─ contact/                  (unchanged; data.ts gains a write path for ContactMessage)
│  └─ admin/                    ⬅ NEW — admin-only feature slices, same conventions
│     ├─ dashboard/
│     ├─ media-library/
│     ├─ messages/
│     ├─ analytics/
│     ├─ ai-console/
│     └─ users/
│
├─ shared/                      (unchanged — generic hooks/utils/types)
│
├─ lib/                         ⬅ NOW POPULATED (was reserved, empty — ARCHITECTURE.md §5)
│  ├─ prisma.ts                    PrismaClient singleton
│  ├─ auth.ts                      Clerk server helpers + permission-check utilities
│  ├─ cloudinary.ts                Cloudinary SDK client
│  ├─ resend.ts                    Resend email client
│  ├─ ai/
│  │  ├─ embeddings.ts              Embedding generation client
│  │  ├─ chat.ts                    LLM chat client + prompt assembly
│  │  └─ ingestion.ts               KnowledgeSource sync-on-publish logic
│  └─ analytics/
│     └─ track.ts                   Server-side event recording helper
│
├─ providers/
│  └─app-providers.tsx           `<ClerkProvider>` slot now filled in (was a documented no-op — ARCHITECTURE.md §7)
│
├─ constants/ , config/          (unchanged)
│
prisma/
├─ schema.prisma                 ⬅ NEW — implements domain-model.md 1:1
├─ migrations/                   ⬅ NEW — one reviewable migration per schema change
└─ seed.ts                       ⬅ NEW — imports today's static `data.ts` arrays as seed data
```

Nothing in `app/(public)` changes its *content*; it moves one directory
level to sit beside `app/(admin)`, and `middleware.ts` is added at the root
to route-protect the admin group. This is a mechanical, low-risk move —
exactly the kind of change this architecture was designed to make boring.

## 6. Non-goals for this phase

Explicitly **not** decided or designed yet (deferred to their own future
design pass, once the foundation above is built and validated):

- Multi-tenancy (this platform is single-owner; multi-tenant SaaS is out of scope).
- Real-time collaborative editing (optimistic concurrency, covered in
  `database-design.md`, is sufficient — no CRDTs/OT needed).
- Internationalization / localization of content.
- A public API for third-party consumers (Route Handlers can absorb this
  later — see §4.6 — but no contract is designed now).
- Payment/monetization of any kind.
