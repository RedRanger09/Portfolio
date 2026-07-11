# Phase 16 — Public Blog platform

## Routes

- `/blog` — landing (search, category filter via first tag, pagination)
- `/blog/[slug]` — article (markdown, related, prev/next, SEO + Article JSON-LD)

## Homepage

`LatestWritingSection` below Contact (not a scroll-spy section). Hidden when no published posts.

## Nav

`Blog` → `/blog` (route-only `NavigationItem` without section `id`).

## Category

No `BlogCategory` model — first tag is used as soft category for chips/filter/related.
