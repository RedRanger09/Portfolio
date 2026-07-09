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
  vars each of the above needs.

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

## What was intentionally NOT done (per the brief)

- No models, no tables, no migrations — `schema.prisma` has zero `model`
  blocks. Authoring the real schema from `domain-model.md` is Phase 5.2/6,
  not this phase.
- No CRUD, no auth, no APIs beyond the health check, no admin dashboard.
- Cloudinary/Resend/OpenAI SDKs are **not installed** — only their
  configuration shape exists (`src/lib/{cloudinary,resend,ai}.ts`), each
  throwing a clear error if called, since there's nothing behind them yet.

## Live connectivity verification

The mechanism (`/api/health`, `checkDatabaseConnection()`) is complete and
gracefully reports `{ ok: false, error: 'DATABASE_URL is not set...' }`
when no database is configured — confirmed locally with `DATABASE_URL`
unset. **Verifying an actual live Neon connection requires a real
`DATABASE_URL`/`DIRECT_URL` pair**, which only the project owner can
provide (Neon project creation isn't something this phase can do on your
behalf). Once added to `.env.local`, `npm run dev` and a request to
`/api/health` (or `npx prisma db pull` against the empty schema) completes
this phase's verification step.
