# Architecture

Internal engineering documentation for the portfolio codebase. This describes
*why* the project is organized the way it is, not just what's in each folder.
If you're adding a feature and unsure where something belongs, start here.

## Status

- **Phase 1** — Next.js 15 + TypeScript migration, data layer, config, constants, hooks. ✅
- **Phase 2** — Application shell: root layout, Navbar, Footer, Providers, page composition. ✅
- **Phase 2.5** — Architectural refinement: feature-first structure, shared layer, env strategy, asset organization. ✅
- **Phase 3** — Ported all public portfolio sections (Hero, About, Journey, Skills, Projects, Education, Certifications, Resume, Contact) from `legacy-vite/`. ✅
- **Backend architecture design** — domain model, database design, CMS design, and infrastructure fully documented in `docs/architecture/` and `docs/infrastructure/`, before any backend code. ✅
- **Phase 5.1** — Infrastructure foundation: Prisma installed and connected to Neon, `lib/` bootstrapped, health-check endpoint, config placeholders for Cloudinary/Resend/AI. No models, no CRUD yet — see `docs/infrastructure/phase-5-1-implementation-notes.md`. ✅
- **Phase 5.2** — Core Portfolio Prisma schema (12 models, 4 enums) authored from `docs/architecture/domain-model.md` and migrated to Neon, still empty — see `docs/infrastructure/phase-5-2-implementation-notes.md`. ✅
- **Phase 5.3** — Seeded Neon with the real portfolio content and switched every feature's `data.ts` from static arrays to Prisma queries (with a static fallback on database failure). Added `JourneyMilestone` (the one Phase 5.2 scoped out). No CRUD, API routes, or admin surface yet — see `docs/infrastructure/phase-5-3-implementation-notes.md`. ✅
- **Phase 5.4** — Backend mutation layer: one `create`/`update`/`delete` Next.js Server Action per list entity and one `update` action per singleton, each feature owning its own Zod schema(s) and validating through a shared `MutationResult<T>`/`runMutation()` pattern (`src/lib/mutation-result.ts`). Documented no-op placeholders for future Clerk authorization (`src/lib/auth-placeholder.ts`) and audit logging (`src/lib/audit-placeholder.ts`). Still no admin UI, forms, or API routes calling into any of this — see `docs/infrastructure/phase-5-4-implementation-notes.md`. ✅
- **Phase 6** (this document) — Admin Foundation: the complete `/admin` route structure and dashboard shell (sidebar, topbar, breadcrumbs, mobile nav), one placeholder page per future module (Projects, Hero, About, Journey, Skills, Education, Certificates, Resume, Contact, Media, Blog, Messages, Analytics, AI, Settings), and the shared admin component set (`AdminCard`, `StatCard`, `SectionTitle`, `EmptyState`, `AdminTableShell`, `LoadingCard`, `ModulePlaceholder`). Required restructuring `app/` into a `(site)` route group + a sibling `admin/` root layout (two independent root layouts, Next.js's documented pattern for this exact case) plus `app/global-not-found.tsx` for the one 404 case that pattern costs you. No CRUD, forms, or authentication wired up yet — `assertAdminAccess()` is called but still a no-op — see `docs/infrastructure/phase-6-implementation-notes.md`. ✅
- **Phase 7** (next) — Clerk authentication (wires up `assertAdminAccess()` for real); first real CRUD module wired to the mutation actions Phase 5.4 built.

---

## 1. Philosophy

Four rules govern every structural decision in this codebase:

1. **Colocate by domain, not by file type.** A feature's types, data-access
   function, hooks, and components live together in one folder. You should
   never have to jump between four unrelated top-level folders to understand
   one section of the site.
2. **One-directional dependencies.** `app/` → `features/` → `shared/` /
   `constants/` / `config/`. Nothing in `shared/` or `constants/` ever
   imports from `features/`. This is what keeps the import graph acyclic and
   makes any single feature deletable without a ripple effect.
3. **The data layer is the only seam that changes when the backend arrives.**
   Every `data.ts` exports `async` functions today returning static objects.
   When Prisma/a CMS arrives, only the *body* of those functions changes —
   every component that calls `getProjects()` stays untouched.
4. **Don't build structure you can't fill yet.** Empty `components/` or
   `hooks/` folders for features with no components/hooks yet are deliberately
   *not* created. Structure is added when there's real code to put in it —
   see [§10](#10-adding-a-new-portfolio-section) for how that happens in Phase 3.

## 2. Folder structure

```
src/
├─ app/                        Next.js App Router — routes only, no business logic
│  ├─ (site)/                   Route group — public site's own root layout
│  │  ├─ layout.tsx               Root layout: fonts, metadata, providers, SiteShell
│  │  ├─ page.tsx                 Home page composition
│  │  ├─ not-found.tsx / error.tsx  Route-level error boundaries
│  │  └─ projects/[slug]/page.tsx  Project case-study pages
│  ├─ admin/                    Plain folder — /admin is a real path segment
│  │  ├─ layout.tsx               Admin's own root layout: AdminShell, no SiteShell
│  │  ├─ page.tsx / loading.tsx / error.tsx / not-found.tsx
│  │  ├─ [...catchAll]/page.tsx   Gives /admin/* a reachable not-found boundary
│  │  └─ <module>/page.tsx        One route per future admin module (§13)
│  ├─ global-not-found.tsx      Self-contained 404 for URLs outside both root layouts
│  └─ globals.css               Shared by both (site) and admin root layouts
│  # Two independent root layouts because /admin's dashboard shell shares
│  # no chrome with the public Navbar/Footer — see phase-6-implementation-notes.md.
│
├─ features/
│  ├─ portfolio/                One folder per home-page section
│  │  ├─ hero/        (types.ts, data.ts, index.ts)
│  │  ├─ about/       (types.ts, data.ts, index.ts)
│  │  ├─ journey/     (types.ts, data.ts, index.ts)
│  │  ├─ skills/      (types.ts, data.ts, index.ts)
│  │  ├─ projects/    (types.ts, data.ts, index.ts)
│  │  ├─ education/   (types.ts, data.ts, index.ts)
│  │  ├─ certifications/ (types.ts, data.ts, index.ts)
│  │  └─ contact/     (types.ts, data.ts, index.ts)
│  │     # `resume/` intentionally doesn't exist yet — see §3.
│  │     # `components/` and `hooks/` subfolders arrive per-feature in Phase 3.
│  │     # every feature above also has `schemas/` + `actions/` — Phase 5.4.
│  └─ admin/                    /admin's own components — not a "portfolio" section
│     ├─ layout/       (admin-shell.tsx, admin-topbar.tsx, admin-footer.tsx, index.ts)
│     ├─ navigation/   (admin-nav-items.ts, admin-sidebar.tsx, admin-mobile-nav.tsx, admin-breadcrumbs.tsx, index.ts)
│     ├─ dashboard/    (admin-dashboard-overview.tsx, index.ts)
│     └─ shared/       (admin-card.tsx, stat-card.tsx, section-title.tsx, empty-state.tsx, admin-table-shell.tsx, loading-card.tsx, module-placeholder.tsx, index.ts)
│
├─ components/
│  ├─ layout/                   App-shell chrome — one instance per app, not reusable
│  │  ├─ site-shell.tsx          Composes Navbar + main + Footer + cross-cutting UI
│  │  ├─ cursor-glow.tsx
│  │  ├─ skip-to-content-link.tsx
│  │  ├─ navbar/                 Navbar + its private subcomponents + its ScrollSpy hook
│  │  └─ footer/                 Footer + its colocated footer.data.ts
│  └─ placeholders/              TEMPORARY — deleted once Phase 3 lands real sections
│
├─ shared/                      Reusable code with NO ties to a specific feature
│  ├─ types/                     Cross-cutting types used by 2+ features (AccentColor, SectionId, SiteConfig, ...)
│  ├─ hooks/                     Generic hooks (use-magnetic, use-mouse-parallax, use-media-query, use-gsap-reveal)
│  └─ utils/                     Small pure helpers (cn, formatTagId, isExternalHref)
│     # shared/components/ will be added in Phase 3 when UI primitives
│     # (GlassCard, Badge, MagneticButton, SectionHeader, TechLogo, ...) are ported.
│
├─ constants/                   Static, app-wide configuration values (NOT reusable code)
│  ├─ theme.ts                   Accent color → Tailwind class mappings
│  ├─ tech-logos.ts              Tech name → Simple Icons slug mappings
│  ├─ navigation.ts               NAVIGATION_ITEMS
│  ├─ animation.ts                Framer Motion presets
│  └─ sections.ts                 HOME_SECTION_ORDER, SECTION_LABELS
│
├─ config/                      Application-level configuration singletons
│  ├─ site.config.ts              Identity, SEO defaults, social links (SITE)
│  └─ env.ts                      Typed environment variable access (env)
│
├─ providers/                   React context composition root
│  └─ app-providers.tsx           <AppProviders> — see §7
│
└─ lib/                         Vendor/infra clients — the boundary where the app talks outward (§5)
   ├─ prisma.ts                  PrismaClient singleton — connects to Neon Postgres
   ├─ db-health.ts               checkDatabaseConnection() — used by app/api/health
   ├─ cloudinary.ts               @future — config placeholder, no SDK installed yet
   ├─ resend.ts                   @future — config placeholder, no SDK installed yet
   └─ ai.ts                       @future — config placeholder (models decided, no SDK installed yet)
```

### Why `constants/` and `shared/` are different folders

Both hold "stuff many features use," but the distinction matters:

- **`constants/`** = static *data* — plain values and lookup tables with no
  behavior (`SECTION_THEMES`, `NAVIGATION_ITEMS`). These describe the site's
  configuration, not its logic.
- **`shared/`** = reusable *code* — types, hooks, and utils with actual logic
  or generic component contracts. If it has a function body or a React
  render, it belongs in `shared/` (or a feature, if domain-specific); if it's
  just data, it belongs in `constants/`.

## 3. Feature-based architecture — what's there and what's deliberately not

Each entry in `src/features/portfolio/` corresponds to a section in
`HOME_SECTION_ORDER`. Today each one owns exactly `types.ts` + `data.ts` +
`index.ts`, because that's genuinely all that exists right now (the actual
UI still lives in `legacy-vite/`, unported).

**`resume/` does not have a feature folder yet.** Unlike every other section,
the Resume section has no dedicated content shape — it renders directly from
`SITE.resumePath` / `SITE.resumePreview`. There's no `types.ts` or `data.ts`
to move there today. When Phase 3 builds the actual `<ResumeSection />`
component, that's when `features/portfolio/resume/components/` is created —
manufacturing an empty feature folder now would be structure with nothing in it.

**`components/` and `hooks/` subfolders don't exist inside any feature yet**,
for the same reason: Phase 3 hasn't ported any section UI, so there's no
component or feature-specific hook to colocate. See §10 for exactly how these
get added.

## 4. Content layer: colocated in features, not a global `lib/data/` or `content/`

The original Phase 1 layout had a global `src/lib/data/*.data.ts` — one file
per domain, all living in the same folder as each other but away from their
types (`src/types/*.ts`). That's a **layered** architecture (group by file
type: all types together, all data together). This refactor moves to a
**vertical-slice** architecture (group by domain: a feature's types and data
live in the same folder).

This directly answers the "will this survive a Prisma migration?" question:

```ts
// Today — src/features/portfolio/projects/data.ts
const projects: Project[] = [ /* static array */ ]
export async function getProjects(): Promise<Project[]> {
  return projects
}

// Tomorrow — same file, same signature, same import path everywhere
import { prisma } from '@/lib/prisma'
export async function getProjects(): Promise<Project[]> {
  return prisma.project.findMany({ orderBy: { featured: 'desc' } })
}
```

No component changes. No import path changes. Only this one function body
changes, one feature at a time — you could migrate `projects` to Prisma
while `certifications` is still static, and nothing breaks.

A dedicated top-level `content/` directory was considered and rejected: it
would just be `lib/data/` renamed, and it still separates data from the types
and (eventually) components that describe the same domain. Colocating inside
`features/portfolio/<domain>/` is strictly better because renaming or
deleting a feature is a single folder operation instead of a hunt across
three directories.

## 5. `lib/` — vendor/infra clients

`src/lib/` is the boundary where the app talks to an external system rather
than represents the site's own content. As of Phase 5.1:

- `lib/prisma.ts` — the `PrismaClient` singleton (standard Next.js pattern to
  avoid creating a new client on every hot-reload in dev), connected to Neon
  Postgres. **Live** — this is the first `lib/` client actually wired up.
- `lib/db-health.ts` — `checkDatabaseConnection()`, backing
  `app/api/health/route.ts`. **Live.**
- `lib/cloudinary.ts` — Cloudinary config placeholder. `@future` — no SDK
  installed; becomes a real client in Phase 8.
- `lib/resend.ts` — Resend email config placeholder. `@future` — no SDK
  installed; becomes a real client in Phase 10.
- `lib/ai.ts` — AI Assistant config placeholder (chat/embedding model
  choice already decided — see
  `docs/infrastructure/infrastructure-overview.md §4`). `@future` — no SDK
  installed; becomes a real client in Phase 11.
- `lib/auth.ts` — not yet created. Clerk server-side helpers land in
  Phase 6, if needed beyond the SDK's own exports.

This is a different job from `shared/`: `shared/` is internal, dependency-free
application code; `lib/` is the boundary where the app talks to the outside
world. Keeping that distinction means "where's the Prisma client?" always has
one obvious answer. See
`docs/infrastructure/phase-5-1-implementation-notes.md` for the specific
implementation details (two connection strings, Prisma version pin) this
phase settled that the architecture docs left open.

## 6. Import organization

- **Path alias**: `@/*` → `src/*`. No additional aliases (like `@/features/*`)
  were added — they'd be redundant with `@/*` and are one more thing to keep
  in sync in `tsconfig.json`.
- **Barrel exports exist at the leaf level only**: `shared/types/index.ts`,
  `shared/hooks/index.ts`, and each `features/portfolio/<domain>/index.ts`
  re-export their own folder's contents.
- **No mega-barrel.** There is deliberately no `features/portfolio/index.ts`
  that re-exports every feature, and no top-level `shared/index.ts` that
  re-exports types+hooks+utils together. A single aggregating barrel becomes
  a hotspot that every feature imports from, which is exactly how accidental
  cross-feature coupling and circular imports get introduced later. Importing
  `@/features/portfolio/projects` directly is one character longer than
  `@/portfolio` and immeasurably safer.
- **Colocation beats a shared file when there's exactly one consumer.**
  `useActiveSection` lives in `components/layout/navbar/`, not `shared/hooks/`,
  because only the Navbar uses it. `FooterData`/`getFooterData()` lives in
  `components/layout/footer/footer.data.ts`, not in the `contact` feature,
  for the same reason — footer copy isn't "contact" content, it's the
  footer's own content.

## 7. Providers — composition root for cross-cutting concerns

`src/providers/app-providers.tsx` is a single `<AppProviders>` component
that today just passes `children` through. It exists so that **every**
future cross-cutting concern gets added in exactly one place, in a
documented order, instead of each feature reaching for its own context:

```
<AnalyticsProvider>        outermost — observes every route change & error boundary
  <ClerkProvider>          auth before anything that needs a user/session
    <QueryClientProvider>  TanStack Query, keyed off the session above it
      <ThemeProvider>      presentational, safe to nest deep
        <ChatbotProvider>  innermost — depends on the above, nothing depends on it
          {children}
```

`app/layout.tsx` will never need to change again as providers are added —
only `app-providers.tsx` does.

## 8. Environment architecture

`src/config/env.ts` exports a single typed `env` object, backed internally
by a Zod schema. As of Phase 5.1, `databaseUrl`/`directUrl` are **live** —
`lib/prisma.ts` depends on them. Every other secret (`CLERK_SECRET_KEY` +
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLOUDINARY_CLOUD_NAME` +
`CLOUDINARY_API_KEY`/`_SECRET`, `RESEND_API_KEY` + `RESEND_FROM_EMAIL`,
`OPENAI_API_KEY`, `GOOGLE_ANALYTICS_ID`) is still declared on the `Env`
interface as optional and documented with an `@future` tag, even though
none of them are set yet. `.env.example` mirrors the same list for local
setup, with Neon-specific guidance on the pooled-vs-direct connection
string split.

`NEXT_PUBLIC_APP_URL` (consumed by `app/layout.tsx`'s `metadataBase` / Open
Graph `url`, falling back to `SITE.siteUrl`) and `DATABASE_URL`/
`DIRECT_URL` are the only variables actually read by running code today.

**Validated at module load, via Zod.** `env.ts` parses the entire
`process.env` against a Zod schema once, on first import — a build/dev
server that starts at all has already passed validation. Every field is
`.optional()` (nothing here is required for the app to run yet — that's
still gated by each feature's own "is this configured?" check, e.g.
`isCloudinaryConfigured()`), but any value that *is* set is checked for
shape: `DATABASE_URL`/`DIRECT_URL` must be `postgres`-prefixed URLs,
`RESEND_FROM_EMAIL` must be a valid email, API keys must be non-empty. A
malformed value throws one formatted error listing every failing field and
why, instead of an ambiguous failure deep inside a database or API call.
`env.ts`'s public shape (`Env` interface, `env.databaseUrl` etc.) is
unchanged by this — Zod only replaced the file's internals.

## 9. Public assets

```
public/
├─ resume/            Akshay-Tiwari-Resume.pdf, resume-preview.png
├─ images/            profile.jpg
├─ icons/             favicon.svg
├─ logos/             (empty — see below)
├─ project-images/    Screenshots & architecture diagrams referenced by features/portfolio/projects
└─ certificates/      Certificate images referenced by features/portfolio/certifications
```

`logos/` exists but is empty by design: technology logos (Python, React,
PyTorch, ...) are fetched at request-time from the Simple Icons CDN via
`constants/tech-logos.ts`, not stored locally. If that ever changes (e.g. to
avoid a CDN dependency), downloaded SVGs would land here.

`certificates/` stays a top-level sibling of `project-images/` rather than
nesting under `images/` — both directories hold "proof of real work"
screenshots in the same spirit, and forcing an extra nesting level under
`images/` for one of them but not the other would be inconsistent for no
benefit.

**Housekeeping done alongside the reorganization:** 11 confirmed-orphaned
files were removed rather than moved — 6 placeholder certificate SVGs, 2
AgentOps project images (that project was removed from the data earlier), 2
duplicate old-format Lumora SVGs superseded by real PNGs, and an unreferenced
root-level `icons.svg` sprite sheet. All were verified unreferenced anywhere
in `legacy-vite/` or `src/` before deletion. Also removed: `src/assets/`,
`src/App.css`, `src/data/`, `src/utils/` — dead leftovers from the original
`npm create vite` scaffold, unreferenced anywhere.

## 10. Adding a new portfolio section

1. Create `src/features/portfolio/<name>/types.ts` and `data.ts` (+`index.ts`
   barrel re-exporting both).
2. Add the section's ID to `SectionId` in `shared/types/common.ts`.
3. Register it in `constants/sections.ts` (`HOME_SECTION_ORDER`,
   `SECTION_LABELS`) and `constants/navigation.ts` (`NAVIGATION_ITEMS`, if it
   should appear in the Navbar).
4. Build `src/features/portfolio/<name>/components/<name>-section.tsx` (Server
   Component by default — see §11) and add `hooks/` only if the section needs
   client-only interactive logic that isn't generic enough for `shared/hooks/`.
5. Swap the matching `<SectionPlaceholder>` in `app/page.tsx` for the real
   component.

## 11. Adding a new top-level feature (e.g. Blog)

Follow the same shape as `portfolio/`: `src/features/blog/{types.ts, data.ts,
components/, hooks/, index.ts}`, plus its own route segment under `app/blog/`.
Blog posts reuse `<SiteShell>` for consistent Navbar/Footer; only the `<main>`
content differs per route.

## 12. Rendering strategy: Server vs. Client Components

Default to a **Server Component**. Only add `'use client'` when a file needs:

- Browser-only APIs (`window`, `document`, `IntersectionObserver`) — see
  `use-active-section.ts`, `use-mouse-parallax.ts`.
- Interactivity/state (`onClick`, `useState`) — see `MobileNavToggle`.
- A hook that itself requires the client (`useReducedMotion`, `useScroll`).

Data-fetching components (`Footer`, and every future `<XSection />`) stay
`async` Server Components that call their feature's `getXData()` directly —
no client-side fetching, no loading spinners, no extra JS shipped for static
content. `SiteShell` composes client Navbar + server `<main>` + server Footer
in one Server Component, which is why it isn't itself a "client" file even
though its children are a mix.

## 13. Future systems — where they'll attach

| System | Attaches at |
|---|---|
| **Prisma** | `lib/prisma.ts` (client, connected to Neon — done in Phase 5.1) + each feature's `data.ts` function bodies swap from static arrays to queries, once `prisma/schema.prisma` has real models (Phase 5.2/6). Types in each feature's `types.ts` become the shape Prisma's generated types are mapped to (or replaced by them directly). |
| **Admin Dashboard** | Shell built in Phase 6 (`app/admin/`, `src/features/admin/`) — sidebar, topbar, breadcrumbs, 15 module placeholders. What's left: Clerk wires into the existing `assertAdminAccess()` call in `app/admin/layout.tsx`; each module page swaps `<ModulePlaceholder>` for a Server Component reading via the feature's existing `getProjects()`/`getCertifications()`/etc. and mutating via the Server Actions already built in Phase 5.4 (`create-project.ts`, `update-project.ts`, ...). |
| **Blog** | New `src/features/blog/` (mirrors `portfolio/`) + `app/blog/` routes. Reuses `<SiteShell>`. |
| **AI Chatbot** | `<ChatbotProvider>` slot in `app-providers.tsx` (§7) + a new `src/features/chatbot/` (or a `shared/components/` widget if it's a single floating button with no dedicated content model). |
| **Resend (contact form)** | `lib/resend.ts` client, called from a new `app/api/contact/route.ts`, using `env.resendApiKey`. |
| **Cloudinary** | `lib/cloudinary.ts` client; `screenshot`/`architectureImage`/`image` fields in feature types stay `string` URLs — only *where* that URL points to changes (from `/project-images/*.png` to a Cloudinary URL). |

## 14. Naming conventions

- Files: `kebab-case.ts` / `kebab-case.tsx` (`use-active-section.ts`, `nav-brand.tsx`).
- Components: `PascalCase` exports (`export function NavBrand()`), file name matches in kebab-case.
- Hooks: `camelCase`, prefixed `use` (`useActiveSection`).
- Data-access functions: `getX()` / `getXBySlug()`, always `async`, always
  return a typed `Promise`.
- Per-feature files: exactly `types.ts`, `data.ts`, `index.ts` — no domain
  prefix (it's `features/portfolio/hero/data.ts`, not `hero.data.ts`) since
  the folder already names the domain.

## 15. Code organization rules

- ~250 lines per file; split by responsibility, not by arbitrary line count.
- A file gets its own `'use client'` boundary only when it needs one — keep
  that boundary as low in the tree as possible.
- Never import a feature from `shared/`, `constants/`, or `config/` (one-directional dependency rule — see §1).
- Prefer a feature's own `index.ts` import over reaching into `feature/data`
  or `feature/types` directly from outside the feature.
- New environment variables get documented in `config/env.ts` and
  `.env.example` in the same commit that introduces them, even if unused for
  a few more commits.
