# Deployment & Operations

> Companion to [`infrastructure-overview.md`](./infrastructure-overview.md).
> Covers the deploy pipeline (GitHub → Vercel → Preview → Production),
> rollback, zero-downtime guarantees, monitoring, and caching strategy.

## 1. Deployment pipeline

```
Developer pushes a branch / opens a PR
        │
        ▼
GitHub Actions CI  (typecheck · lint · build   [+ tests, once they exist])
        │
        ├─ fail → PR blocked from merge (branch protection rule) — nothing deploys
        │
        └─ pass
             │
             ▼
     Vercel Git integration builds a Preview Deployment
        - unique URL: <branch>-<project>.vercel.app
        - fresh Neon branch created from `main`, migrations applied
          (database-and-storage.md §1.2)
        - all Preview-scoped env vars injected
             │
             ▼
     Human review: functional check on the live Preview URL
        + (optional, future) Bugbot/automated review on the diff
             │
             ▼
     Merge to `main`
             │
             ▼
     Vercel Git integration builds Production
        - `prisma migrate deploy` runs as a pre-deploy step
        - Production-scoped env vars injected
        - new deployment fully built & warmed BEFORE traffic switches
             │
             ▼
     Atomic cutover — old deployment kept, instantly promotable
```

**Branch protection rule** (GitHub, `main`): require the CI check to pass
before merge is allowed. This is what makes "merge to `main` = safe to
deploy" actually true, rather than aspirational.

### 1.1 Migration ordering (why this pipeline never breaks mid-deploy)

Vercel's cutover is atomic for the *application*, but the *database* is a
single shared resource the old and new app versions briefly both point at
during the deploy window. The rule that makes this safe, restated from
`database-design.md` and enforced here at the pipeline level:

> Every migration must be **backward-compatible with the previous
> deployment** — because for a few seconds, the previous deployment might
> still be serving a request against the *new* schema.

Practically: **expand, then contract.**

- Adding a column → add it **nullable** (or with a default) first; a
  migration that adds a `NOT NULL` column with no default breaks the
  outgoing version's `INSERT`s the instant it's applied.
- Renaming a column → add the new column, backfill, dual-write for one
  deploy cycle, remove the old column in a **later, separate** deploy —
  never rename in place.
- Dropping a column → stop reading/writing it in the app first (one
  deploy), drop it in a **subsequent** deploy once nothing references it.

This is a process rule, not a tool — no migration framework enforces it
automatically; it's a discipline documented here so it survives past this
conversation.

## 2. Rollback

| Scenario | Rollback mechanism | Time to recover |
|---|---|---|
| Bad application code (bug, regression, broken build that somehow passed CI) | **Promote the previous deployment** in the Vercel dashboard/CLI — every deployment is immutable and kept, this is a pointer swap, not a rebuild | **Seconds** |
| Bad migration, app is fine | Because migrations are additive-only (§1.1), the previous app version keeps working unmodified against the new schema — no DB rollback is normally *needed* | N/A — designed to not happen |
| A genuinely destructive migration was applied by mistake | Restore Neon to a point-in-time **before** the migration, onto a **new branch**, verify data, then repoint the Production connection string at it (a deliberate, manual, reviewed action — not automated) | Minutes to an hour, deliberately slower than the app rollback since it's the higher-stakes action |
| Bad third-party integration change (e.g. a Clerk webhook contract change) | Revert the specific integration code, redeploy (same path as "bad application code") | Seconds to minutes |

## 3. Zero downtime

Vercel's deployment model is zero-downtime **by construction** — a new
deployment is fully built, and its functions are warmed, before any traffic
is routed to it; the switch from old to new is atomic, not a rolling
restart with a gap. Nothing needs to be configured to get this; it's the
default behavior of deploying to Vercel.

The only place zero-downtime is *not* automatic is the database migration
layer, which is why §1.1's expand/contract discipline exists — it's what
extends Vercel's zero-downtime app deploys into zero-downtime *releases*
(app + schema together).

## 4. Monitoring

| Concern | Tool | What it catches |
|---|---|---|
| **Errors / crash reporting** | **Sentry** (Next.js SDK — client + server + edge) | Unhandled exceptions, promise rejections, React error boundaries, Server Action failures — with source-mapped stack traces, so a production error points at real file/line, not minified code |
| **Performance (client)** | **Vercel Speed Insights + Analytics** | Core Web Vitals (LCP, CLS, INP) per real visitor, per route — flags a regression (e.g. a new hero image tanking LCP) before it's a support ticket |
| **Performance (server)** | **Sentry Performance/Tracing** | Slow Server Actions, slow DB queries, slow calls out to Clerk/Cloudinary/the LLM provider — with enough detail to tell which of those it was |
| **Availability / uptime** | **Better Uptime** (external synthetic checks) | Pings the homepage and `/api/health` from outside Vercel's own network on a short interval — catches a Vercel-wide or DNS-level outage that Vercel's own dashboard obviously can't self-report during |
| **Logs** | Vercel's built-in function/edge logs (short retention) → **Axiom** once traffic/retention needs exceed Vercel's default window | Request-level detail for debugging a specific incident after the fact |
| **Alerts** | Sentry alert rules (error-rate spike, new error type) → email; Vercel deployment-failure notifications; Better Uptime → email/SMS on a failed health check; Neon/Cloudinary usage alerts as they approach plan quotas (a cost-control alert, not just a technical one) | Turns "something is wrong" into a notification instead of a discovery |

### 4.1 Health check endpoint

`/api/health` — a Route Handler that pings the database (`SELECT 1` via
Prisma) and returns a simple JSON status. This is the one endpoint every
monitoring layer above depends on: Better Uptime polls it externally,
and it doubles as a fast internal sanity check right after any deploy
("did the new deployment actually connect to the database").

### 4.2 Structured logging

Logs are written as structured JSON (not free-text) from day one, even
before Axiom is wired in — this is a decision about the *shape* of the
data, made now, specifically so plugging in a log aggregator later is a
configuration change, not a rewrite of every `console.log` call across the
codebase.

## 5. Caching

| Data | Strategy | Mechanism |
|---|---|---|
| Public portfolio pages (Hero, About, Projects, etc.) | Long cache, revalidated on publish | **ISR** — a page-level `revalidate` plus **on-demand revalidation** (`revalidatePath`/`revalidateTag`) triggered directly by the CMS's Publish Server Action, so a content change is visible immediately rather than waiting out a timed revalidation window |
| Expensive derived reads (e.g. "the featured project," admin dashboard aggregates) | Tag-based server cache | Next.js `unstable_cache` / Data Cache, invalidated by the same publish-time tag as above |
| Raw database query results | **No dedicated cache layer** | Postgres's own query planner and shared buffers are sufficient at this platform's data volume (reaffirming `database-design.md §11`) — adding Redis-as-a-DB-cache preemptively would be complexity spent on a problem that doesn't exist yet; revisit only if profiling shows real DB-bound latency |
| Static assets (`_next/static`, fonts, icons) | Long, `immutable` browser cache | Automatic, via Next.js/Vercel's default headers — no configuration needed |
| HTML pages | Short/no browser cache | Deliberately short so ISR's server-side revalidation is what visitors actually see, not a stale browser copy |
| Media (images, PDFs) | CDN-cached at the edge, plus responsive/format-negotiated variants | Cloudinary's CDN + `next/image`'s own optimization cache — effectively double-cached without any extra configuration (`database-and-storage.md §2.7`) |
| AI chat responses | **Not cached** — each conversation is contextual | The only related cache is the **embeddings themselves**, which are already persisted in `pgvector` and only regenerated when source content is re-published (`future-roadmap.md §1.4`), not per query — that re-embed-on-publish rule *is* the AI subsystem's cache strategy |

The unifying idea across every row above: **the CMS's publish action is
the one and only cache invalidation trigger** for content-derived data.
Nothing else independently decides a cache is stale — which keeps "why is
the site showing old content" a one-place-to-check question rather than a
five-cache-layers-to-check question.
