# Phase 6 Implementation Notes — Admin Foundation

Phase 5.4 finished the backend mutation layer — 22 Server Actions across
every portfolio feature, all reachable only by direct import (no UI, no
routes, nothing calls them yet). This phase builds the *shell* those
actions will eventually be wired into: the complete `/admin` route
structure, its own dashboard layout, and one placeholder page per future
module. No business logic, no forms, no authentication, no mutations —
structural foundation only.

## Routing restructure — why `app/` changed shape first

The brief's layout requirements (sidebar, its own topbar, no public
Navbar/Footer) can't be satisfied by adding `app/admin/layout.tsx` alone.
Next.js nests every layout inside its parent by folder structure, with no
"skip the parent layout" escape hatch — as long as a single
`app/layout.tsx` existed wrapping `{children}` in `<SiteShell>`, *every*
route including `/admin/*` would render inside the public Navbar/Footer
chrome, no matter what `admin/layout.tsx` contained.

The fix is Next.js's documented pattern for this exact scenario —
multiple root layouts via route groups:

```
src/app/
├─ (site)/            route group — invisible in the URL
│  ├─ layout.tsx        the OLD app/layout.tsx, unchanged, moved here
│  ├─ page.tsx           (moved, untouched)
│  ├─ not-found.tsx       (moved, untouched)
│  ├─ error.tsx           (moved, untouched)
│  └─ projects/[slug]/page.tsx  (moved, untouched)
├─ admin/             plain folder — /admin is a real path segment
│  ├─ layout.tsx        NEW — admin's own <html>/<body>, AdminShell
│  ├─ page.tsx           dashboard
│  ├─ loading.tsx
│  ├─ error.tsx
│  ├─ not-found.tsx
│  ├─ [...catchAll]/page.tsx   see below
│  └─ <15 module folders>/page.tsx
├─ global-not-found.tsx   NEW — see below
├─ globals.css          unchanged, now imported by both root layouts
└─ api/health/route.ts  unchanged, unaffected by any of this
```

`(site)`'s parentheses are stripped from the URL — `/` and
`/projects/[slug]` resolve to the exact same paths, rendered by the exact
same component tree, as before. This was verified, not assumed: a
production build + `next start` smoke test confirmed `/`,
`/projects/lumora`, and `/api/health` all return unchanged output after
the move.

**The one thing this pattern costs you:** with two independent root
layouts, Next.js has no single shared layout left to compose a "URL
matches no route at all" 404 from. `global-not-found.tsx` (Next 15.4's
`experimental.globalNotFound` flag, enabled in `next.config.ts`) is the
documented answer — a fully self-contained page (own `<html>`, own font
import, own `globals.css` import) that catches anything outside both
`(site)` and `admin`'s trees. It's styled identically to
`(site)/not-found.tsx` but is *not* what most visitors will ever see:
`(site)/not-found.tsx` still handles every `notFound()` call and
unmatched path within the public site (verified: a bad `/projects/*`
slug still renders inside the full `SiteShell`, Navbar and Footer
included), and `admin/not-found.tsx` handles the same within `/admin/*`.

**The `[...catchAll]` route** exists for a subtler reason: `not-found.tsx`
only activates for an explicit `notFound()` call *within an already-
matched route tree* (or a failed dynamic-segment match). A genuinely
unmatched URL — no `page.tsx` registered for that exact path — never
enters the layout tree at all from the router's perspective, so it skips
segment-level `not-found.tsx` boundaries entirely and falls straight to
`global-not-found.tsx`. Since `/admin` has no dynamic segment yet, without
this catch-all, a mistyped `/admin/*` URL would show the public-styled
global fallback instead of the admin one — confirmed by reproducing it
before adding the catch-all, and confirmed fixed after (see Verification).
`admin/[...catchAll]/page.tsx` is one line (`notFound()`); it exists
purely to give the router something to match so `notFound()` can bubble to
`admin/not-found.tsx` normally, rendered inside the real `AdminShell`.

## Admin architecture

```
src/features/admin/
├─ layout/
│  ├─ admin-shell.tsx      Server Component — sidebar + topbar + <main> + footer
│  ├─ admin-topbar.tsx     Server Component — composes client mobile-nav + breadcrumbs
│  ├─ admin-footer.tsx     Server Component — one line of text
│  └─ index.ts
├─ navigation/
│  ├─ admin-nav-items.ts   data: ADMIN_NAV_GROUPS/ADMIN_NAV_ITEMS + isAdminNavItemActive()
│  ├─ admin-sidebar.tsx    'use client' — desktop nav, active-state via usePathname
│  ├─ admin-mobile-nav.tsx 'use client' — hamburger + off-canvas drawer, self-contained state
│  ├─ admin-breadcrumbs.tsx 'use client' — derives trail from usePathname
│  └─ index.ts
├─ dashboard/
│  ├─ admin-dashboard-overview.tsx   /admin's page content
│  └─ index.ts
└─ shared/
   ├─ admin-card.tsx        the one bordered-surface primitive everything else composes with
   ├─ stat-card.tsx
   ├─ section-title.tsx
   ├─ empty-state.tsx
   ├─ admin-table-shell.tsx  header row + frame + empty fallback — chrome only, no table logic
   ├─ loading-card.tsx
   ├─ module-placeholder.tsx  what every module's page.tsx actually renders
   └─ index.ts
```

Mirrors the brief's requested shape exactly — no `hooks/` or `types.ts`
folder was added since neither has real content yet (same "don't build
structure you can't fill" rule `ARCHITECTURE.md §1` already states for
`features/portfolio/*`). No `src/features/admin/index.ts` mega-barrel
either, for the same reason `ARCHITECTURE.md §6` gives for not having one
across `features/portfolio/*`: `app/admin/**` imports
`@/features/admin/layout`, `@/features/admin/navigation`, etc. directly.

## Layout decisions

- **`AdminShell` is a Server Component.** It composes `AdminSidebar`
  (client), `AdminTopbar` (server, itself composing `AdminMobileNav` and
  `AdminBreadcrumbs`, both client) and a plain `<main>` — the same
  "server shell wraps client nav pieces" shape `SiteShell` already uses
  for `Navbar`/`CursorGlow`.
- **Sidebar and mobile nav are both client components**, not because of
  interactivity alone but because active-link highlighting needs the
  current pathname, and there's no Server Component API for "what route
  is currently rendering" in a nested layout — the identical reasoning
  the public `Navbar` already relies on for `useActiveSection`.
- **Breadcrumbs are also client**, deriving their trail from
  `usePathname()` rather than accepting an `items` prop — a prop-driven
  version would need every future module page to thread its own
  breadcrumb array back up through the layout, which doesn't compose with
  how the App Router passes data (layouts only ever receive `children`).
  Only one level deep today (Admin → current module) since no admin route
  nests further yet.
- **Desktop sidebar and mobile drawer are two separate components**
  sharing no lifted state, unlike the public Navbar's
  `MobileNavToggle`/`MobileNavDrawer` split — here both pieces have
  exactly one consumer (`AdminTopbar`), so there's no sibling to lift
  `open` state *to*; `AdminMobileNav` just owns it internally.
- **Visual language is 100% reused, not reinvented.** Every color token
  (`bg-background`, `bg-surface`, `border-white/[0.08]`, `text-primary`,
  the five `AccentColor`s from `constants/theme.ts`), every focus-ring
  class, and `lucide-react` for icons — identical to the public site.
  "Clearly administrative" comes entirely from the *layout* (sidebar +
  topbar instead of navbar + sections + footer), not from a different
  palette — this was a deliberate reading of "visually complement... while
  remaining clearly administrative."

## Shared admin components

All six requested primitives were built, plus one more that turned out to
be needed once 16 module pages existed:

| Component | Purpose | Notable decision |
|---|---|---|
| `AdminCard` | Bordered surface everything else sits on | `padded` boolean prop, not a `className` override — this codebase's `cn()` (`@/shared/utils`) is a naive class-joiner with no `tailwind-merge`-style dedup, so a plain override can't reliably win against Tailwind's own cascade order. Caught this before it shipped a padding bug. |
| `StatCard` | Dashboard metric tile | Takes a placeholder `value` (e.g. `'—'`) — no database read; wiring a real count later is a same-file, same-shape change, per `ARCHITECTURE.md §4`'s stated pattern for the data layer. |
| `SectionTitle` | Page heading + optional action slot | Admin's counterpart to the public `SectionHeader`. |
| `EmptyState` | "Nothing here" surface | Used for singleton-shaped module placeholders now; reusable later for genuine empty data states. |
| `AdminTableShell` | Table *chrome* (header row + frame) | Explicitly not a real table — no sorting, pagination, or row model, per "do not build actual tables." Falls back to `EmptyState` when no rows are passed. |
| `LoadingCard` | Skeleton for `loading.tsx` | `role="status"`/`aria-live="polite"` + `sr-only` text, `motion-reduce:animate-none`. |
| `ModulePlaceholder` | *(added, not in the original list)* | All 15 module pages render the identical "not implemented yet" shape (title + either a table preview or an empty state) — this was the "reusable only if shared across multiple modules" bar, met by all 15 at once. |

## Navigation architecture

`ADMIN_NAV_GROUPS` (grouped: ungrouped Dashboard, then "Portfolio",
"Content & engagement", "System") is a flat, hand-written array — not
derived from the public site's `NAVIGATION_ITEMS`. The two lists look
similar but describe different things: one is in-page anchors for a
one-page marketing site, the other is real routes for a multi-page admin
app. Forcing a shared source of truth between them would couple two
things that will change for unrelated reasons the moment either does.

Route naming: the sidebar *label* says "Certificates" (matching the
brief's wording), but the route is `/admin/certifications` — matching the
existing `features/portfolio/certifications` folder/model name. This is
the exact same label-vs-id split the public Navbar already has
(`NAVIGATION_ITEMS` labels certifications as "Certificates" while the
section `id` stays `certifications`).

## Accessibility

- `SkipToContentLink` (existing, generic, reused as-is) targets
  `#admin-main-content`.
- `<aside>`, `<nav aria-label="Admin sections">`, `<header>`, `<footer>`,
  `<main>` — real landmarks, not `<div>` soup.
- `aria-current="page"` on the active sidebar/drawer link; `aria-expanded`
  + `aria-controls` on the mobile toggle (mirrors the public
  `MobileNavToggle` exactly).
- Every interactive element has a visible `focus-visible:ring-2` state
  and is reachable by keyboard (native `<a>`/`<button>`, no
  `div onClick`).
- `LoadingCard` uses `role="status"`/`aria-live="polite"` with `sr-only`
  text, not just a visual pulse.
- `motion-reduce:animate-none` on every CSS animation; `useReducedMotion()`
  gates the mobile drawer's slide transition (falls back to a plain
  opacity fade), same pattern the public Navbar uses.

## Performance considerations

- Every module page, the dashboard, and both layouts are **Server
  Components**. The build confirms it: all 16 admin routes prerender as
  fully static (`○`) — zero server work per request until a real data
  source is wired in.
- Client boundaries are as low in the tree as possible and justified in
  each case by a real browser-only need (`usePathname`, `useState` for a
  drawer, `useReducedMotion`) — three small client files
  (`admin-sidebar.tsx`, `admin-mobile-nav.tsx`, `admin-breadcrumbs.tsx`),
  not a client-wrapped shell.
- No new dependencies. `framer-motion` and `lucide-react` were already
  installed and used by the public site; the admin mobile drawer reuses
  the exact same library rather than introducing a second animation
  approach.

## Future authentication integration

`app/admin/layout.tsx` calls `assertAdminAccess()`
(`src/lib/auth-placeholder.ts`, added in Phase 5.4) as the *route-level*
gate for every `/admin/*` page — today a no-op, so every admin route is
reachable by anyone who knows the URL. This is in addition to, not a
replacement for, the *action-level* calls already wired into every Server
Action. When Clerk lands, this one call becomes a real `redirect('/sign-in')`
(or a `middleware.ts` check ahead of it, if session state needs to be read
before any admin code runs) — nothing else under `app/admin/**` changes.
The account-menu placeholder in `AdminTopbar` (a static circular icon)
reserves the exact spot a real avatar/sign-out menu will occupy.

## Future RBAC integration

No role model exists yet, so there's nothing to branch on today. Once
`assertAdminAccess()` is real, a coarse check ("is this user an admin at
all") belongs inside that function; a finer one (e.g. "can this user
publish, or only draft") would compose as a second, per-module check
inside individual pages or Server Actions — documented at the call site
in `app/admin/layout.tsx`'s docblock rather than half-built here.

## Future CRUD integration strategy

Every module page currently renders `<ModulePlaceholder>`. Wiring up a
real module (say, Projects) means, in that one page only:

1. Replace `<ModulePlaceholder ... />` with a real Server Component that
   calls the feature's existing `getProjects()` and renders
   `<AdminTableShell columns={...}>` with real `<tr>` rows instead of no
   `children`.
2. Add row actions (edit/delete) that call the Server Actions Phase 5.4
   already built (`updateProject`, `deleteProject`) — no new backend code.
3. Add a form (new work, not built yet) for `createProject`/`updateProject`.

No other admin file changes — the shell, sidebar, topbar, and every other
module page are completely unaffected by one module going live.

## Reusable patterns introduced

- `AdminCard`'s `padded` prop instead of a `className` padding override —
  worth remembering anywhere else a consumer needs to zero out a shared
  component's default spacing in this codebase, given `cn()` has no
  conflict resolution.
- `ModulePlaceholder`'s `previewColumns?: string[]` prop cleanly
  distinguishes list-shaped modules (get a table preview) from
  singleton-shaped ones (get a plain empty state) from one component.
- The `[...catchAll]` + `notFound()` trick for giving a route segment a
  reachable local 404 boundary when it has no dynamic segment of its own.

## Verification performed

- `npm run typecheck` — clean, before and after the `[...catchAll]` fix.
- `npm run lint` — clean.
- `npm run build` — clean; all 16 `/admin/*` routes plus `/`,
  `/projects/[slug]`, `/api/health` build successfully; every admin route
  (except the dynamic catch-all) prerenders fully static.
- `next start` + direct HTTP requests (no browser automation, per the
  brief) confirmed:
  - `/`, `/projects/lumora`, `/api/health` — unchanged (200).
  - `/projects/nonexistent-slug` — still renders `(site)/not-found.tsx`
    **inside the full public `SiteShell`** (Navbar + Footer present in
    the response).
  - A genuinely unmatched top-level path — renders
    `global-not-found.tsx` (no Navbar/Footer, as designed).
  - `/admin`, `/admin/projects`, `/admin/hero`, `/admin/settings`,
    `/admin/ai` — all render inside `AdminShell` with **no public
    Navbar/Footer** and a `noindex` robots tag.
  - `/admin/nonexistent` — before adding `[...catchAll]`, incorrectly fell
    through to `global-not-found.tsx`; after adding it, correctly renders
    `admin/not-found.tsx` inside `AdminShell`. Confirmed via response-body
    inspection, not just status code (note: `notFound()` returns HTTP 200
    on a streamed dynamic response per Next.js's documented behavior — the
    content, not the status code, is the correct signal here).

## Production-readiness assessment

**Ready:** routing structure, layout composition, navigation data model,
shared component set, accessibility (landmarks, keyboard, focus, reduced
motion), and performance posture (static by default) are all
production-grade today — a real module can be wired to real data and
Server Actions without touching the shell, sidebar, topbar, or any other
module.

**Deliberately deferred, as scoped:** authentication (no-op call site
exists), RBAC (no role model), forms, CRUD, file uploads, and every
module's actual content. None of these were in scope for this phase.
