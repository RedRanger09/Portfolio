# Phase 5.1 Implementation Notes — Infrastructure Foundation

> Companion to the [`docs/architecture/`](../architecture/) and
> [`docs/infrastructure/`](./) design documents. Those documents are
> frozen; this one records the handful of places where actually wiring up
> Prisma + Neon required a decision more specific than the architecture
> phase made — and confirms everywhere else, implementation matched the
> design exactly.

## What this phase built

- `prisma/schema.prisma` — datasource + generator only, **zero models**.
  Proves the connection path (client generation → connectivity) before any
  domain model is authored.
- `src/lib/prisma.ts` — the `PrismaClient` singleton, exactly as
  `ARCHITECTURE.md §5` already described.
- `src/lib/db-health.ts` + `src/app/api/health/route.ts` — the health
  check endpoint `docs/infrastructure/deployment-and-operations.md §4.1`
  named but didn't implement.
- `src/lib/cloudinary.ts`, `src/lib/resend.ts`, `src/lib/ai.ts` —
  configuration placeholders (env-var-backed getters that throw a clear
  error if called before their real Phase 8/10/11 integration lands). No
  SDKs installed — these files hold a *shape*, not a client.
- `src/config/env.ts` / `.env.example` — extended with the concrete env
  vars each of the above needs, and (in a follow-up pass — see §5 below)
  validated at module load with Zod.

## Where implementation added detail the architecture docs left open

### 1. Two connection strings, not one (`DATABASE_URL` + `DIRECT_URL`)

`database-and-storage.md §1.2` recommended Neon specifically because of its
built-in pooling, but didn't spell out that Prisma needs **two** distinct
connection strings once real migrations exist: a pooled one for the
running app, and a **direct, unpooled** one for `prisma migrate`/
`prisma db pull`, which don't work reliably through a transaction-mode
pooler (Neon's pooler, and PgBouncer generally). `prisma/schema.prisma`
therefore declares both `url` and `directUrl` on the `datasource` block.

This has no effect on today's zero-model schema, but it's set up now so
Phase 5.2/6 (authoring the real schema and running the first migration)
doesn't hit a surprise mid-migration. `.env.example` documents which of
Neon's two "Connect" dialog connection strings goes in which variable.

### 2. Prisma major version pinned to 6.x, not 7.x

`prisma`/`@prisma/client` were deliberately installed at **6.19.3**, not
the newest available major (7.x), even though 7.x was the version `npm
install` resolved to by default. Prisma 7 makes its new "rust-free"
`prisma-client` generator the default, which:

- requires an explicit `output` path (generates into `src/generated/`
  instead of `node_modules/@prisma/client`),
- is ESM-first, and
- requires an explicit **driver adapter** (e.g. `@prisma/adapter-pg`) to
  actually talk to Postgres — plain `new PrismaClient()` is no longer
  sufficient.

None of that was anticipated by `ARCHITECTURE.md §5`, which documents the
classic `new PrismaClient()` singleton reading `DATABASE_URL` directly —
and the ROLE brief for this phase is explicit: don't introduce a new
architectural pattern unless the tooling leaves no other choice. Standard
Node.js runtime (which every Server Component and Route Handler in this
app uses — none run on the Edge runtime) has no technical requirement for
a driver adapter; that requirement is specific to Prisma 7's new default,
not to Neon or to serverless deployment in general. Pinning to the latest
stable 6.x line keeps the implementation matching the documented
architecture exactly, at the cost of not being on the newest major
version. **Revisit this pin** when the driver-adapter model has matured
and a real migration guide exists, not before — likely alongside Phase 6
or later, as its own reviewed change, never as a silent `npm update`.

### 3. `postinstall: prisma generate`

Added as an npm script so the generated client is always regenerated after
a fresh `npm install` — matches the standard Prisma recommendation and
means a teammate (or a fresh CI checkout) never hits a "Prisma Client not
generated" error just from cloning and installing.

### 4. Local npm install-script allowlisting

This machine's npm (11.x) requires explicit approval
(`npm approve-scripts`) before running a new package's install/postinstall
scripts — a supply-chain-safety feature unrelated to this project's own
choices. `prisma`, `@prisma/client`, and `@prisma/engines` were approved
once (their postinstall step downloads the Windows query-engine binary,
without which the client can't run at all). Recorded here only so a future
`npm install` on a clean machine that behaves the same way isn't a
mystery — it's this environment's npm being cautious, not a project
misconfiguration.

### 5. Environment validation added via Zod (originally deferred)

The first Phase 5.1 pass deliberately shipped `env.ts` as a plain object
with safe fallbacks, and documented Zod as a "migration path, not
implemented yet" (see `ARCHITECTURE.md §8`'s prior revision). A follow-up
pass installed `zod` and implemented that migration path exactly as
described: `env.ts` now parses `process.env` through a Zod schema once, at
module load, and every existing call site (`env.databaseUrl`, `env.appUrl`,
...) is unchanged.

Every field in the schema is `.optional()` — this is a validation layer,
not a "require every future integration" layer. Nothing here makes
`DATABASE_URL` or any Cloudinary/Resend/OpenAI/Clerk variable mandatory to
build or run the app; that would have broken `next build` on this exact
machine, which has no `.env.local` yet. What Zod adds is *shape* checking
for whatever *is* set — a `DATABASE_URL` that isn't `postgres`-shaped, or
an API key set to an empty string, now fails immediately with a listed,
readable error instead of surfacing as a cryptic Prisma or SDK error later.
Verified by temporarily setting `DATABASE_URL=not-a-valid-url` and
confirming `next build` fails fast with `Invalid environment variables:
- DATABASE_URL: Invalid input`, then confirming a clean build resumes once
removed.

### 6. Windows + Prisma: an intermittent `EPERM` on `prisma generate`

Re-running `npx prisma generate` against an *unchanged* schema
intermittently fails on this machine with `EPERM: operation not permitted,
rename ...query_engine-windows.dll.node.tmpXXXX -> ...query_engine-windows.dll.node`,
even with no other Node process running — almost certainly Windows
Defender (or a similar real-time scanner) briefly opening the freshly
written binary between its write and rename. It's non-blocking:
`node_modules/.prisma/client/schema.prisma` already matches
`prisma/schema.prisma` byte-for-byte from the last successful generate
(confirmed via `Compare-Object`), so the existing generated client is
correct and current, and `next build`/`tsc --noEmit` both pass against it.
Only matters if a *future* session edits `prisma/schema.prisma` and hits
the same lock — retrying the command, or excluding
`node_modules/.prisma` from real-time scanning, resolves it.

## What was intentionally NOT done (per the brief)

- No models, no tables, no migrations — `schema.prisma` has zero `model`
  blocks. Authoring the real schema from `domain-model.md` is Phase 5.2/6,
  not this phase.
- No CRUD, no auth, no APIs beyond the health check, no admin dashboard.
- Cloudinary/Resend/OpenAI SDKs are **not installed** — only their
  configuration shape exists (`src/lib/{cloudinary,resend,ai}.ts`), each
  throwing a clear error if called, since there's nothing behind them yet.

## Live connectivity verification

The mechanism (`/api/health`, `checkDatabaseConnection()`) gracefully
reports `{ ok: false, error: 'DATABASE_URL is not set...' }` when no
database is configured — confirmed locally with `DATABASE_URL` unset.

**Update (Phase 5.2 kickoff):** a real Neon `DATABASE_URL`/`DIRECT_URL`
pair was provided and wired up. Verification completed:

- `npx prisma db pull --print` connected successfully and correctly
  reported `P4001 The introspected database was empty` (expected — no
  models existed yet at that point).
- `GET /api/health` against a production build returned
  `{"status":"ok","database":{"ok":true,"latencyMs":2656}}`.

One setup issue found and fixed while wiring this up: `.env.local` had
been created by copying `.env.example` (which still has its placeholder
`DATABASE_URL`/`DIRECT_URL` lines) and then appending the real Neon
`DATABASE_URL` as a second, later declaration in the same file. Dotenv-style
parsers resolve duplicate keys "first occurrence wins," so the app would
have silently connected using the placeholder host, not the real one —
and no `DIRECT_URL` had been added at all. Fixed by replacing the
placeholder pair in place with the real pooled/direct URLs (the direct URL
derived by dropping `-pooler` from the pooled host — Neon's standard
naming convention for its two endpoint variants).

A second, separate gap: the Prisma CLI (`prisma generate`/`validate`/
`migrate`) only reads a file literally named `.env` — it has no knowledge
of Next.js's `.env.local` convention, which only the Next.js dev/build
server understands. A root `.env` (gitignored, same as `.env.local`) was
added holding just `DATABASE_URL`/`DIRECT_URL`, exclusively for the CLI's
benefit; the running app still reads everything through `.env.local` via
`src/config/env.ts`, unchanged.
