# Phase 11 Implementation Notes — Production Hardening

Phase 11 prepares the Portfolio Platform for its first Vercel production
deployment. No product features were added; this phase is audit, polish,
and deployment readiness only.

## Folder changes

```
.github/workflows/ci.yml              NEW — typecheck, lint, build on PR/push
src/app/robots.ts                   NEW — crawler directives
src/app/sitemap.ts                  NEW — public URL index (home + project slugs)
src/app/global-error.tsx            NEW — root-level error boundary
next.config.ts                      MODIFIED — security headers, poweredByHeader: false
src/config/env.ts                   MODIFIED — Vercel Production env enforcement
src/app/(site)/layout.tsx           MODIFIED — OG/Twitter image → existing /images/profile.jpg
.env.example                        MODIFIED — production notes, Cloudinary uncommented
package.json                        MODIFIED — prisma:migrate:deploy script
ARCHITECTURE.md                     MODIFIED — Phase 11 status, auth-placeholder fix
```

**Removed:** Stale `TODO(auth, Phase 6)` comments from all Server Actions (auth
is wired via `assertAdminAccess()` since Phase 7).

**Intentionally unchanged:** Blog, Messages, Analytics, AI, Settings admin
placeholders; `audit-placeholder.ts`, `lib/ai.ts`, `lib/resend.ts` future stubs.

## Production improvements

| Area | Change |
|---|---|
| **SEO** | `robots.ts` disallows `/admin`, auth, and `/api`; `sitemap.ts` lists home + project slugs |
| **Metadata** | Fixed broken `/og-image.png` reference → `/images/profile.jpg` (existing asset) |
| **Error handling** | `global-error.tsx` for catastrophic root-layout failures |
| **Env validation** | `assertProductionEnv()` when `VERCEL_ENV=production` |
| **CI** | GitHub Actions workflow: `npm ci`, typecheck, lint, build |
| **Migrations** | `npm run prisma:migrate:deploy` for Vercel build command |
| **Docs** | `.env.example` documents Neon pooled/direct URLs and per-environment Clerk |

## Performance improvements

No speculative optimizations were applied. Existing patterns were verified:

- **Server Components by default** — admin pages fetch data on the server; client
  components limited to editors, lists, and interactive UI.
- **Lean list queries** — admin collection modules select only display fields.
- **Static generation** — project pages use `generateStaticParams` with DB fallback.
- **Image optimization** — `next/image` remote patterns for Cloudinary, Clerk,
  Simple Icons; local SVGs allowed for trusted repo assets.
- **Health endpoint** — `force-dynamic` prevents build-time DB connection attempts.

## Security audit

| Control | Status |
|---|---|
| Secrets server-only | ✅ All secrets read via `src/config/env.ts`; no `NEXT_PUBLIC_*` secrets |
| Middleware | ✅ `/admin(.*)` protected by Clerk `auth.protect()` |
| Authorization | ✅ `assertAdminAccess()` in admin layout + every mutation |
| Server Actions | ✅ Zod validation + `runMutation()` + owner email gate |
| Upload validation | ✅ `assertAdminAccess()` on media actions; MIME/size checks in media service |
| Security headers | ✅ CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy |
| Safe redirects | ✅ Auth redirects to `/sign-in` or `/unauthorized` only |
| CSP compatibility | ✅ Clerk, Cloudinary, Simple Icons allow-listed |

**Not implemented (documented future):** Sentry, Upstash rate limiting (contact
form / AI), RBAC beyond owner email.

## SEO audit

| Item | Status |
|---|---|
| `metadataBase` | ✅ `env.appUrl` in site layout |
| Title / description | ✅ From `SITE` config |
| Open Graph | ✅ Site + per-project `generateMetadata` |
| Twitter cards | ✅ `summary_large_image` |
| `robots.txt` | ✅ `src/app/robots.ts` |
| `sitemap.xml` | ✅ `src/app/sitemap.ts` |
| Canonical URLs | ✅ Project pages set `alternates.canonical` |
| Admin noindex | ✅ `admin/layout.tsx` robots |
| Auth pages noindex | ✅ sign-in, sign-up, unauthorized |
| Structured data | Not added — no existing JSON-LD to extend |

## Cleanup performed

- Removed 20 stale `TODO(auth, Phase 6)` comments from Server Actions
- Fixed `ARCHITECTURE.md` reference from `auth-placeholder.ts` → `auth.ts`
- Fixed broken OG image path (`/og-image.png` did not exist in `public/`)

## Remaining known issues

| Issue | Severity | Notes |
|---|---|---|
| No Sentry / error monitoring | Low | Documented in deployment docs; add post-launch |
| No rate limiting on public endpoints | Low | Contact form not live; only `/api/health` is public API |
| Section headings not CMS-editable | Info | Static strings in portfolio `data.ts` |
| Lumora `liveDemo` points to `example.com` | Info | Seed/fallback content — update via Projects CMS |
| CSP uses `unsafe-inline` / `unsafe-eval` for Clerk | Info | Required for Clerk + Next.js; tighten when Clerk supports nonces |
| Preview deployments skip strict env check | Info | Only `VERCEL_ENV=production` enforces required vars |
| `legacy-vite/` folder | Info | Pre-migration reference; ignored by ESLint |

## Deployment checklist

### 1. Neon (PostgreSQL)

- [ ] Create production database branch
- [ ] Set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in Vercel Production
- [ ] Run `npm run prisma:migrate:deploy` (add to Vercel build command or run once manually)
- [ ] Run `npm run prisma:seed` on first deploy if database is empty

### 2. Clerk

- [ ] Create a **separate** Clerk application for Production
- [ ] Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- [ ] Configure sign-in/sign-up URLs to match env vars
- [ ] Enable MFA for admin account (recommended in security docs)
- [ ] Set `ADMIN_EMAIL` to your owner email

### 3. Cloudinary

- [ ] Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Verify upload folders (`hero`, `projects`, `resume`, `certificates`) work in admin

### 4. Vercel

- [ ] Connect GitHub repository
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain (e.g. `https://akshaytiwari.dev`)
- [ ] **Build command:** `npm run prisma:migrate:deploy && npm run build`
- [ ] Attach custom domain; confirm HTTPS redirect
- [ ] Enable branch protection on `main` requiring CI pass

### 5. Post-deploy verification

- [ ] Hit `/api/health` — `database.ok: true`
- [ ] Public homepage loads all sections
- [ ] `/projects/lumora` renders
- [ ] `/robots.txt` and `/sitemap.xml` accessible
- [ ] Sign in → `/admin` → edit content → verify public site updates
- [ ] Upload image in Hero or Projects editor

## Production readiness

**Yes — the project is production-ready for its first public release.**

All portfolio content CMS modules are functional. Security, SEO, env validation,
CI, and deployment documentation are in place. Remaining gaps (Sentry, rate
limiting, Blog, Analytics) are intentionally deferred and documented.

Do not deploy from this phase — follow the checklist above on Vercel.
