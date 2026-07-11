# Phase 18 — Visibility Management

> Soft-hide public portfolio sections and collection items without deleting CMS data.

## Level 1 — SiteSettings section flags

Additive columns on `SiteSettings` (all default `true`):

`showHero`, `showAbout`, `showJourney`, `showSkills`, `showProjects`, `showEducation`, `showCertificates`, `showResume`, `showBlog`, `showContact`, `showContactForm`, `showInterests`

Admin → Settings → **Visibility** tab.

Public consumers read once via `getPublicVisibility()` (`react.cache`) in `src/features/settings/visibility.ts`.

That config drives:

- Homepage section list (`getVisibleHomeSections`)
- Navbar + scroll spy (`getVisibleNavigationItems` → `SiteShell` → `Navbar`)
- Contact form (`showContactForm`)
- Hero interest cards (`showInterests` ∧ `Hero.showInterestCards`)
- Blog routes + sitemap (`showBlog`)

## Level 2 — Collection `isVisible`

Additive `isVisible Boolean @default(true)` on:

`Project`, `JourneyMilestone`, `SkillCategory`, `Education`, `Certification`, `BlogPost`

Public `data.ts` queries add `where: { isVisible: true }` (blog also keeps `status: PUBLISHED`).

Admin lists keep returning every row and expose `VisibilityToggleButton` with optimistic updates through existing `update*` actions.

## Revalidation

`recordAuditEvent` → `revalidatePublicContent()` after settings and item toggles.

## Migration

`prisma/migrations/20260712033000_add_visibility_management/migration.sql`
