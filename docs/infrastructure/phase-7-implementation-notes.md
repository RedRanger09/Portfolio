# Phase 7 Implementation Notes — Authentication Foundation

Phase 6 built the admin shell with a no-op `assertAdminAccess()`. This phase
wires production Clerk authentication and owner-only authorization while
keeping the public portfolio fully public.

## Folder changes

```
src/
├─ middleware.ts                          NEW — Clerk middleware, protects /admin/*
├─ lib/
│  ├─ auth.ts                             NEW — real assertAdminAccess + auth/authz split
│  └─ auth-placeholder.ts                 DELETED — replaced by lib/auth.ts
├─ lib/mutation-result.ts                 MODIFIED — FORBIDDEN type + MutationForbiddenError
├─ config/env.ts                          MODIFIED — ADMIN_EMAIL + Clerk redirect URLs
├─ providers/app-providers.tsx            MODIFIED — ClerkProvider wired in
├─ features/admin/layout/
│  ├─ admin-user-menu.tsx                 NEW — profile image, name, email, SignOutButton
│  └─ admin-topbar.tsx                    MODIFIED — placeholder replaced with AdminUserMenu
├─ app/(site)/
│  ├─ sign-in/[[...sign-in]]/page.tsx     NEW — Clerk SignIn
│  ├─ sign-up/[[...sign-up]]/page.tsx     NEW — Clerk SignUp
│  └─ unauthorized/page.tsx               NEW — 403 for signed-in non-owners
├─ app/admin/layout.tsx                   MODIFIED — assertAdminAccess('route')
└─ features/portfolio/*/actions/*.ts      MODIFIED — import @/lib/auth (19 files)

.env.example                              NEW — documents Clerk + ADMIN_EMAIL
next.config.ts                            MODIFIED — img.clerk.com for profile avatars
package.json                              MODIFIED — @clerk/nextjs ^7.5.16
```

## Authentication architecture

```
Request
  ↓
middleware.ts (Clerk — authentication only for /admin/*)
  ↓
assertAdminAccess('route') in app/admin/layout.tsx
  ├─ requireAuthenticatedSession()  ← Clerk auth() + currentUser()
  └─ authorizeOwnerAccess(email)    ← ADMIN_EMAIL comparison
  ↓
[Future RBAC extension point]
  ↓
Admin page / Server Action
```

Server Actions follow the same chain via `assertAdminAccess()` (default
`mutation` mode), which throws `MutationForbiddenError` instead of
redirecting.

## Middleware strategy

- `clerkMiddleware()` runs on all matched routes (standard Clerk matcher).
- Only `/admin(.*)` calls `auth.protect({ unauthenticatedUrl: '/sign-in' })`.
- Public routes (`/`, `/projects/*`, `/api/health`, `/sign-in`, `/sign-up`,
  `/unauthorized`) are never protected.
- Middleware handles **authentication** (is there a session?).
- `authorizeOwnerAccess()` in `lib/auth.ts` handles **authorization**
  (is this the owner?) — intentionally separate so RBAC can replace only
  the authorization layer later.

## Clerk integration decisions

- **`@clerk/nextjs` v7** — official App Router SDK, `clerkMiddleware` API.
- **`ClerkProvider`** in `app-providers.tsx` only — never duplicated in
  individual layouts, per `ARCHITECTURE.md §7`.
- **Sign-in/sign-up** under `(site)/` so they share the public root layout
  and `ClerkProvider`. Dark-theme `appearance` matches the portfolio palette.
- **`SignOutButton`** in admin topbar — Clerk's official sign-out control.
- **`useUser()`** for display name, email, and avatar — server-side session
  is not trusted for UI display; Clerk's client hook reads the live session.
- **Profile images** from `img.clerk.com` added to `next.config.ts`
  `remotePatterns`.

## Server-side authorization flow

### `lib/auth.ts` exports

| Function | Responsibility |
|---|---|
| `requireAuthenticatedSession()` | Clerk `auth()` + `currentUser()` — returns `{ userId, email }` |
| `authorizeOwnerAccess(email)` | Compares email to `env.adminEmail` (case-insensitive) |
| `assertAdminAccess(mode)` | Composes both; `route` redirects, `mutation` throws |

### `assertAdminAccess` modes

- **`route`** — used in `app/admin/layout.tsx`:
  - Unauthenticated → `redirect('/sign-in')`
  - Authenticated non-owner → `redirect('/unauthorized')`
- **`mutation`** (default) — used in all 19 Server Actions:
  - Any failure → `MutationForbiddenError`
  - `runMutation()` maps to `{ success: false, error: { type: 'FORBIDDEN' } }`

No authentication logic was duplicated in individual actions — every
mutation still calls `assertAdminAccess()` as its first line.

## Security considerations

- **`CLERK_SECRET_KEY`** and **`ADMIN_EMAIL`** are server-only — never
  `NEXT_PUBLIC_*`.
- **`server-only`** import in `lib/auth.ts` prevents accidental client bundling.
- **Defense in depth**: middleware + layout + Server Actions each verify access.
- **Owner check is server-side** — client `useUser()` is display-only.
- **Admin routes** are `robots: noindex` (from Phase 6) and now dynamic (`ƒ`)
  because auth runs at request time.
- **Public portfolio** has zero auth overhead — middleware passes through
  without `protect()` on public paths.

## Future RBAC integration

Replace or extend `authorizeOwnerAccess()` — not `requireAuthenticatedSession()`
or middleware. Example future shape:

```typescript
export function authorizeAdminAccess(email: string, permission?: Permission): void {
  // Phase 7: owner email check
  // Phase N: role/permission check from database or Clerk org metadata
}
```

`assertAdminAccess()` composes authentication + whatever `authorizeAdminAccess`
becomes — call sites stay unchanged.

## Production readiness

**Ready:**
- Clerk installed and configured
- Middleware protecting admin routes
- Server-side owner authorization
- All 19 mutations return typed `FORBIDDEN` on auth failure
- Admin topbar shows real account info
- `.env.example` documents required variables

**Requires configuration before use:**
- Clerk project keys in `.env.local`
- `ADMIN_EMAIL` set to the owner's email (must match Clerk account email)
- Clerk dashboard: configure allowed redirect URLs for your domain

## Implementation deviations

1. **`sign-up` page added** — not explicitly listed in the brief, but Clerk's
   `SignIn` component links to sign-up and Clerk's quickstart expects both
   routes. Minimal addition, same styling as sign-in.

2. **`/unauthorized` page** — needed to deny authenticated non-owners without
   sending them back to sign-in (they're already signed in). Brief asked to
   "deny authenticated users who are not the owner" — a dedicated 403 page
   is the clearest UX.

3. **`admin/[...catchAll]` remains** — from Phase 6; unchanged. Still routes
   mistyped admin URLs to `admin/not-found.tsx` inside the shell.

4. **Admin routes became dynamic (`ƒ`)** — expected once `assertAdminAccess('route')`
   reads the session per request. Public routes remain static.

## Verification performed

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm run build` — pass (25 routes + 90.7 kB middleware)
- HTTP smoke tests (no browser automation):
  - `/`, `/projects/lumora`, `/api/health` → 200 (public)
  - `/sign-in` → 200
  - `/admin` without session → Clerk middleware active (`x-clerk-auth-status: signed-out`, `x-clerk-auth-reason: protect-rewrite`) — redirects in browser; curl without Clerk dev browser receives Clerk's internal rewrite (expected Clerk behavior for non-browser requests)
