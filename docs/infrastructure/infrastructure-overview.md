# Infrastructure Overview

> **Status:** Infrastructure design only. No Dockerfiles, no service
> configuration, no deployments, nothing installed. This describes the
> target production infrastructure for the Portfolio Platform designed in
> [`docs/architecture/`](../architecture/). Read that set first — this set
> answers "how does it run in production," not "what does it store."
>
> **Document set:**
>
> 1. `infrastructure-overview.md` (this file) — production architecture
>    diagram, environment strategy, recommended software, final stack.
> 2. [`database-and-storage.md`](./database-and-storage.md) — database
>    hosting comparison + recommendation, Cloudinary media design.
> 3. [`deployment-and-operations.md`](./deployment-and-operations.md) —
>    CI/CD pipeline, rollback, zero downtime, monitoring, caching.
> 4. [`security-and-reliability.md`](./security-and-reliability.md) —
>    security controls end-to-end, disaster recovery.
> 5. [`scaling-and-cost.md`](./scaling-and-cost.md) — scaling assessment at
>    10/100/1,000/10,000 users, cost tables, cost-reduction levers.

## 1. Production architecture diagram

```
                                    ┌────────────┐
                                    │  Browser    │
                                    │  (visitor / │
                                    │   admin)    │
                                    └──────┬─────┘
                                           │ HTTPS (TLS via Vercel-managed cert)
                                           ▼
                                    ┌────────────┐
                                    │  DNS        │  Vercel-managed DNS
                                    │  (domain)   │  (or registrar → Vercel nameservers)
                                    └──────┬─────┘
                                           ▼
                                    ┌────────────┐
                                    │  Vercel      │  Global Edge Network (CDN)
                                    │  Edge/CDN    │  — static assets, edge middleware,
                                    │              │    HTTPS termination, DDoS absorption
                                    └──────┬─────┘
                                           ▼
                          ┌──────────────────────────────┐
                          │      Next.js (Vercel Functions) │
                          │  ┌────────────┐  ┌────────────┐ │
                          │  │ Public       │  │ Admin        │ │
                          │  │ (public)     │  │ (admin)      │ │
                          │  │ route group  │  │ route group  │ │
                          │  │ — Server      │  │ — Server      │ │
                          │  │   Components  │  │   Actions +   │ │
                          │  │   (read-only) │  │   Components  │ │
                          │  └──────┬───────┘  └──────┬───────┘ │
                          │         │                   │         │
                          │         └─────────┬─────────┘         │
                          │                    ▼                   │
                          │            lib/prisma.ts                │
                          └──────┬───────┬──────┬───────┬──────────┘
                                 │       │      │       │
              ┌──────────────────┘       │      │       └───────────────┐
              ▼                          ▼      ▼                       ▼
     ┌─────────────────┐      ┌──────────────┐ ┌──────────────┐  ┌──────────────┐
     │  Neon PostgreSQL  │      │  Clerk         │ │  Cloudinary    │  │  Resend        │
     │  (+ pgvector,     │      │  (auth, user    │ │  (media CDN,   │  │  (contact form │
     │   pooled conns)   │      │   webhooks)     │ │   transforms)  │  │   + digest      │
     └─────────────────┘      └──────────────┘ └──────────────┘  │   emails)       │
              ▲                                                     └──────────────┘
              │ queries
     ┌────────┴─────────┐         ┌──────────────┐         ┌──────────────────┐
     │  AI subsystem       │         │  Analytics     │         │  GitHub             │
     │  (embeddings in      │         │  ingestion     │         │  (source of truth,  │
     │   pgvector + LLM     │         │  (Visitor/     │         │   Actions CI,       │
     │   provider API)       │         │   PageView)    │         │   → triggers Vercel │
     └──────────────────┘         └──────────────┘         │   deploys)          │
                                                              └──────────────────┘
     ┌──────────────────────────────────────────────────────────────────────────┐
     │                          Observability plane                              │
     │   Sentry (errors + tracing)  ·  Vercel Analytics (Web Vitals)  ·          │
     │   Vercel/Function logs → Axiom (aggregation, once needed)  ·             │
     │   Uptime monitor (external synthetic checks against /api/health)         │
     └──────────────────────────────────────────────────────────────────────────┘
```

**Read path** (public visitor): Browser → DNS → Vercel Edge/CDN → Next.js
Server Component (public route group) → `lib/prisma.ts` → Neon. Media is
served directly from Cloudinary's CDN, not proxied through Vercel. No
write ever happens on this path except the one sanctioned exception
(contact form submission — `database-design.md §8`).

**Write path** (admin): Browser → Clerk-gated `(admin)` route → Server
Action → `lib/prisma.ts` → Neon, with Cloudinary for media uploads (signed,
direct-to-Cloudinary, not proxied — see `database-and-storage.md §2.1`).

**Deploy path**: GitHub → Vercel (Git integration) → Preview or Production
— full detail in `deployment-and-operations.md §1`.

## 2. Environment strategy

Three environments, each fully isolated at the data layer — this is the
infrastructure-level enforcement of the "single writer" principle from
`system-overview.md §1.2`: an environment boundary is also a blast-radius
boundary.

| | **Development** | **Preview** | **Production** |
|---|---|---|---|
| **Trigger** | Local `npm run dev` | Every pull request | Merge to `main` |
| **URL** | `localhost:3000` | `<branch>-<project>.vercel.app` (unique per PR) | Custom domain |
| **Database** | A personal Neon branch (one per developer — not shared, not local Postgres — see `database-and-storage.md §1`) | An ephemeral Neon branch, created from `main`'s branch per PR, destroyed when the PR closes | Neon's `main` branch |
| **Auth** | Clerk **development instance** (separate keys, test-mode sign-in, no real user data) | Same Clerk development instance as local dev | Clerk **production instance** (separate keys) |
| **Media** | Cloudinary, `dev/` folder prefix on a shared non-production upload preset | Cloudinary, `preview/` folder prefix | Cloudinary, `prod/` folder prefix — the only prefix ever linked from real `Media` rows an end user sees |
| **AI provider** | Same API key as Preview, low-volume, no cost concern | Same key as Development | Separate, rate-limited, monitored key |
| **Env vars** | `.env.local` (git-ignored; `.env.example` documents required keys with no values) | Vercel Preview environment variables (scoped to Preview only in the Vercel dashboard) | Vercel Production environment variables |

### 2.1 Secrets

- **Never committed.** `.env.local` is git-ignored (already the case);
  `.env.example` lists every key name with a placeholder/empty value and a
  one-line comment on where to obtain it (mirrors the pattern already
  established in `config/env.ts`).
- **Stored exclusively in Vercel's encrypted Environment Variables**, scoped
  per environment (Vercel natively supports Development/Preview/Production
  scoping per variable — a Production-only secret is never exposed to a
  Preview build).
- **`NEXT_PUBLIC_*` prefix discipline is a security boundary, not a naming
  convention**: only genuinely public values (analytics IDs, the Clerk
  *publishable* key) ever get that prefix. Every secret (`DATABASE_URL`,
  `CLERK_SECRET_KEY`, `CLOUDINARY_API_SECRET`, the LLM provider key,
  `RESEND_API_KEY`) stays server-only.
- **Secret scanning**: GitHub's built-in secret scanning (enabled by
  default on public repos, recommended explicitly for this one) plus a
  pre-commit hook (`gitleaks` or equivalent) as a second line of defense
  before a secret ever reaches a remote branch.

### 2.2 Rotation

| Secret class | Rotation cadence | Trigger |
|---|---|---|
| `DATABASE_URL` (Neon connection string) | Yearly, or immediately on suspected exposure | Scheduled reminder + incident |
| `CLERK_SECRET_KEY` | Yearly | Scheduled reminder |
| `CLOUDINARY_API_SECRET` | Yearly | Scheduled reminder |
| AI provider key | Every 6 months (higher-value target — usage-billed) | Scheduled reminder |
| `RESEND_API_KEY` | Yearly | Scheduled reminder |
| Any secret with a **confirmed or suspected leak** | Immediately, no exceptions | Incident |

**Rotation runbook (same shape for every secret):** (1) generate a new
credential at the provider without revoking the old one yet, (2) update the
value in Vercel's Environment Variables for the affected environment(s),
(3) trigger a redeploy (or wait for the next natural deploy if the secret
isn't on the hot path), (4) confirm the new credential is live (a health
check or a manual smoke test), (5) **only then** revoke the old credential
at the provider. This order — issue new, verify, then revoke old — is what
makes rotation zero-downtime; revoking first risks an outage if step 2 had
a typo.

### 2.3 Recovery

- **Lost/leaked secret** → the rotation runbook above, run immediately, out
  of its normal schedule.
- **Lost access to a control-plane account** (Vercel, GitHub, Neon, Clerk,
  Cloudinary) — covered as its own scenario in
  [`security-and-reliability.md §5`](./security-and-reliability.md#5-disaster-recovery) (account recovery, not secret recovery).
- **`.env.local` accidentally deleted locally** — no incident; it's
  regenerable from `.env.example` + `vercel env pull` (pulls the
  Development-scoped values from Vercel directly onto a developer's
  machine) — this is precisely why local `.env.local` is disposable and
  Vercel's dashboard, not any laptop, is the actual source of truth.

## 3. Recommended software

Every tool a developer needs during development, and why:

| Tool | Purpose | Why this one |
|---|---|---|
| **Cursor** (or VS Code) | Primary editor | Already in use; Prisma/Tailwind/ESLint extensions available. |
| **Node.js (LTS)** | Runtime | Matches Vercel's build runtime — no dev/prod version drift. |
| **Git + GitHub** | Version control, CI, deploy trigger | Already in place; GitHub is the single source of truth the whole deploy pipeline hangs off. |
| **GitHub CLI (`gh`)** | PR/issue/Actions management from the terminal | Already used in this environment; faster than the web UI for routine operations. |
| **Vercel CLI** | `vercel env pull` (sync env vars locally), `vercel dev` (local edge/function emulation), `vercel logs` | The one tool that keeps "what's configured in Vercel" and "what's on my machine" from drifting apart. |
| **Prisma CLI + Prisma Studio** | Schema authoring, migrations (`prisma migrate dev`), visual data browsing | Comes with the ORM decision already made in `system-overview.md §4.2`; Studio removes the need for a separate DB GUI for routine inspection. |
| **A Neon branch per developer** (not local Postgres/Docker) | Local development database | Avoids "works on my Postgres version, breaks on prod's" drift, and avoids installing/maintaining Docker + a local Postgres instance at all — a branch is created in seconds and costs nothing on Neon's free tier. Docker Desktop remains a reasonable fallback if ever fully offline development is required, but isn't the default recommendation. |
| **TablePlus or Beekeeper Studio** | Ad-hoc SQL queries beyond what Prisma Studio's UI supports | Occasionally needed for debugging a query plan or running a one-off analytics query; free tiers of either are sufficient. |
| **Postman or Thunder Client** | Manually exercising Route Handlers and webhook payloads | Needed specifically for webhook development (Clerk `user.created`, future GitHub webhooks) where a browser can't easily send a signed POST. |
| **ngrok (or Cloudflare Tunnel)** | Expose `localhost` for real webhook delivery during development | Clerk/GitHub webhooks need a public URL to deliver to — this is the standard way to receive them on a laptop before a Preview deployment exists. |
| **1Password** (or equivalent password manager with emergency-access/beneficiary features) | Store every control-plane account's credentials, 2FA recovery codes | The account-recovery story in `security-and-reliability.md §5` is only as strong as this — non-negotiable for a solo-owner platform. |
| **ESLint + Prettier** | Already configured | No change — existing config stays authoritative. |

## 4. Final recommendation — the definitive stack

One choice per category. No alternatives listed here on purpose — the
comparisons and tradeoffs live in the rest of this document set; this is
the decision, not the deliberation.

| Layer | Choice |
|---|---|
| Hosting / compute | **Vercel** |
| Framework | **Next.js 15 (App Router)** |
| Database | **Neon (PostgreSQL, serverless, with pgvector)** |
| ORM | **Prisma** |
| Authentication | **Clerk** |
| Media storage & CDN | **Cloudinary** |
| Email | **Resend** |
| Error monitoring & tracing | **Sentry** |
| Performance monitoring | **Vercel Analytics + Speed Insights** |
| Uptime monitoring | **Better Uptime** |
| Log aggregation (once needed) | **Axiom** |
| Rate limiting | **Upstash Redis + `@upstash/ratelimit`** |
| AI chat model | **OpenAI `gpt-4o-mini`** |
| AI embedding model | **OpenAI `text-embedding-3-small` (1,536 dimensions)** |
| Vector store | **pgvector, inside the same Neon database** |
| DNS / domain | **Vercel's native domain management** |
| Secrets management | **Vercel Environment Variables (native)** |
| CI checks | **GitHub Actions** (`typecheck` / `lint` / `build`, gating merge via branch protection) |
| Deploy trigger | **Vercel's native GitHub integration** |
| Password / secrets hygiene | **1Password** |

This resolves the two open items `docs/architecture/future-roadmap.md §6`
explicitly deferred (database hosting provider, embedding model/dimension)
— see `database-and-storage.md §1` for the Neon decision in full, and note
the embedding model choice above is now committed: **OpenAI
`text-embedding-3-small`, 1,536 dimensions**, so `Embedding.vector`'s column
dimension is no longer an open question when Phase 5/11 schema work begins.
