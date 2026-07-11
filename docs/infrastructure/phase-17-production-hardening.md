# Phase 17 — Production Hardening

> Implementation notes for the pre-deploy production pass.
> Architecture is unchanged; this documents measurable readiness work only.

## What changed

### Cache invalidation (CMS → public)

- Added `src/lib/revalidate-public.ts` (`revalidatePath('/', 'layout')` + sitemap).
- `recordAuditEvent()` now triggers public revalidation after every successful CMS write.
- Media upload / replace / delete / metadata actions call the same helper.

### Contact spam hardening

- Honeypot field (`website`) — silent success when filled.
- Minimum form age (~2s) before accept.
- Soft per-IP rate limit (5 / 15 min, best-effort on serverless).

### Security

- Middleware requires a Clerk session for `/admin(.*)` (owner check still in `assertAdminAccess`).
- SVG uploads rejected server-side; file picker accepts raster formats only.
- `dangerouslyAllowSVG` remains for trusted **repo** SVGs used by `next/image`.

### SEO / a11y / UX

- Site layout: canonical `/`, `robots` index/follow, Person + WebSite JSON-LD.
- Project detail: CreativeWork JSON-LD.
- Public `(site)/loading.tsx` for route transitions.

### Deployment

- `npm run build` → `prisma generate && next build` (CI / local).
- `npm run vercel-build` → `prisma migrate deploy && next build` (set as Vercel Build Command).
- `.env.example` encoding fixed; production Clerk / Vercel notes added.

### Cleanup

- Removed unused `ModulePlaceholder` admin component.

## Deliberately not done (documented limitations)

- No Sentry / Upstash yet (would introduce new services).
- Contact rate limit is instance-local, not globally consistent.
- `legacy-vite/` retained as historical reference (ignored by tooling).
- Maintenance mode UI remains non-enforcing until a dedicated release decision.
- Public Clerk sign-up route remains; disable sign-up in the Clerk **production** dashboard.
