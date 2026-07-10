# Phase 5.3 Implementation Notes — Seed Database & Replace Static Data

Phase 5.2 built the Core Portfolio schema and applied it to Neon, empty. This
phase populates it and switches all nine public portfolio features from
static in-memory arrays to Prisma queries, with a static fallback as a
safety net. No UI, animation, or styling changed; no CRUD, API routes,
auth, or admin surface was added.

## Schema addition: `JourneyMilestone`

Phase 5.2's brief scoped out `JourneyMilestone` (it names 12 entities;
Journey wasn't one of them). This phase's migration order explicitly
includes Journey between Skills and Education, and `docs/architecture/domain-model.md
§4` already fully specifies the entity (`label`, `year`, `description`,
`icon`, `accentColor`, `isCurrent`, `subItems[]`, `order`). Rather than
leave Journey on static data or block on a design question the architecture
already answered, this phase adds `JourneyMilestone` + a `JourneyIcon` enum
as a direct transcription of that existing design (see `prisma/schema.prisma`),
applied as one small additive migration (`20260710083856_add_journey_milestone`)
before seeding. Nothing else about the frozen Phase 5.2 schema changed.

`JourneyStep.id` (a human-readable slug like `"btech"` in the old static
data) is used only as a React list `key` — grepped and confirmed no other
usage — so it was safe to let the DB row's own `cuid()` become the new
`id` value instead of trying to preserve the old slug.

## Seed strategy

`prisma/seed.ts` seeds every value from each feature's `FALLBACK_*`
constant — the exact object literal that feature's `data.ts` already
rendered before this phase, now also kept around as the runtime fallback.
There is deliberately only one place this content is written down:
seeding *from* the fallback constants (instead of retyping the content a
second time in the seed script) makes "seeded content exactly matches the
existing portfolio" true by construction, not by careful transcription.

Key mechanics:

- **Idempotent.** `main()` clears every table it owns (children before
  parents) before inserting, so `npx prisma db seed` converges on the same
  state no matter how many times it's run — no unique-constraint errors on
  a second run.
- **Technology dedup.** Every name in every project's `techStack` and every
  skill group's `items` is collected into one `Set`, then each distinct
  name becomes exactly one `Technology` row (`slug` via a small local
  `slugify`, `logoSlug` via the existing `getTechLogoSlug` from
  `src/constants/tech-logos.ts` — the same function the UI already calls,
  so the stored slug can't drift from what would be computed at render
  time). A `name → id` map is then used to wire up `ProjectTechnology` and
  `Skill` join rows. Result: 32 distinct technologies for 5 projects + 5
  skill categories, with names like "React", "Python", "PyTorch", and
  "TailwindCSS" shared across both without duplication.
- **App enum literal → Prisma enum**, the inverse of
  `src/lib/prisma-enum-mappers.ts`, kept local to the seed script since
  seeding is the only place that direction is needed.
- **JSON fields** (`Hero.interestCards`/`ctas`, `Project.metrics`/`gallery`)
  are passed through a small `toJson<T>()` cast — Prisma's `InputJsonValue`
  needs a generic index signature that concrete app types don't
  structurally have; the values themselves are this codebase's own
  trusted data, not user input, so the cast is safe.

Run via `npx prisma db seed` (`package.json`'s `prisma.seed` field runs it
through `tsx`) or directly with `npx tsx prisma/seed.ts`.

**Verified row counts after seeding** (matches the static content exactly):
Hero 1, About 1, Resume 1, ContactInformation 1, SocialLink 4, Technology 32,
Project 5, ProjectTechnology 15, SkillCategory 5, Skill 30, JourneyMilestone 11,
Education 2, Certification 5.

## Migration order completed

Hero → About → Projects → Skills → Journey → Education → Certifications →
Resume → Contact — all nine, in the order specified. Every feature now
reads from Prisma first; none remain on static-only data (the "static"
arrays still exist in every `data.ts`, renamed `FALLBACK_*`, but they're
now the emergency path, not the primary one).

## Public API — unchanged

Every existing exported function keeps its exact name and signature:
`getHeroData()`, `getAboutData()`, `getProjects()`, `getProjectBySlug(slug)`,
`getFeaturedProject()`, `getAllProjectSlugs()`, `getSkillGroups()`,
`getLearningJourney()`, `getEducation()`, `getCertifications()`,
`getResumeData()`, `getContactInfo()`. No component imports or props
changed — every consumer of these functions required zero edits.

## Error handling — `src/lib/db-fallback.ts`

The one query pattern genuinely repeated across all nine features —
"read from the database; if it's unreachable or empty, serve static
content instead of crashing" — is factored into a single generic helper,
`withDbFallback<T>(queryFn, fallback, label)`:

- Catches any thrown error (connection failure, timeout, bad
  `DATABASE_URL`) and logs `[db:<label>] Query failed — serving static
  fallback content.` with the underlying error, then returns `fallback`.
- Also treats a `null` result (singleton tables: Hero, About, Resume,
  ContactInformation) or an empty array (list tables: Projects, Skills,
  Journey, Education, Certifications) as "nothing usable," logging
  `[db:<label>] Query returned no data — serving static fallback content.`
  and returning `fallback` — an unseeded or accidentally-truncated table
  degrades the same way a network failure does, rather than rendering an
  empty section.
- Verified directly (thrown error, empty array, `null`, and success cases
  all behave correctly) as part of this phase's validation, not just
  inferred from reading the code.

The public portfolio cannot 500 or render blank because of a Neon hiccup —
every migrated getter falls back to the exact static content it served
before this phase.

## Repository layer — what was (and wasn't) introduced

Per the brief's "only abstract where duplication actually exists":

- **`src/lib/db-fallback.ts`** — the fallback/error-handling wrapper above.
  Used by all 9 features' 12 exported getters. This is the repository-layer
  abstraction the brief anticipated ("if repeated query patterns naturally
  appear, introduce small feature-specific repositories") — generalized as
  shared infrastructure rather than duplicated per feature, since the
  pattern is identical everywhere it appears.
- **`src/lib/prisma-enum-mappers.ts`** — `mapAccentColor()`, the one Prisma
  enum (`AccentColor`) actually read by more than one feature (`SkillCategory.accent`,
  `JourneyMilestone.accent`). Every other enum (`SkillIcon`, `EducationType`,
  `SocialLinkIcon`, `JourneyIcon`) is only ever read by the single feature
  that owns it, so those mappers stay as small local `Record<...>` constants
  inside that feature's own `data.ts` rather than being centralized.
- **No generic repository classes.** Projects' four related queries
  (`getProjects`/`getProjectBySlug`/`getFeaturedProject`/`getAllProjectSlugs`)
  share a `PROJECT_INCLUDE` const and a `mapProjectRow()` function, both
  private to `projects/data.ts` — this is the existing "one file, several
  focused exported functions" shape the codebase already used before this
  phase, just now backed by Prisma instead of an in-memory `find`. Skills'
  `mapSkillCategoryRow()` and Journey/Education/Contact's small mapping
  logic follow the same local-to-the-feature pattern. Nothing here spans
  more than one feature, so nothing here was pulled into shared code.

## Query performance considerations

- **Selective fields.** `getAllProjectSlugs()` uses `select: { slug: true }`
  instead of fetching full rows — it's used only to build
  `generateStaticParams`, which needs nothing else.
- **No N+1 queries.** Every list query that needs child rows
  (`Project.technologies`, `SkillCategory.skills`, `ContactInformation.socialLinks`)
  uses a single `include` with a nested `orderBy`, not a per-row follow-up
  query.
- **`React.cache()`** wraps `getHeroData()` and `getProjectBySlug()` (the
  latter already was, from the Project Detail migration) — both are called
  more than once per request in some paths (e.g. `generateMetadata` +
  the page component for `/projects/[slug]`), so the underlying Prisma
  query runs once per request, not twice.
- **Prepared for caching, not caching itself.** No `unstable_cache` /
  `revalidate` tags were added — the brief asked to "prepare the query
  structure for future caching," not implement a caching layer. Every
  query is already isolated behind its feature's `data.ts`, which is
  exactly the seam a future `revalidateTag`-based cache would wrap.
- **Singleton reads use `findFirst()`**, not `findMany()[0]` — one row is
  fetched, not the whole (one-row) table.

## What still uses static data, and why

Nothing does, by design — this phase's explicit goal was to move all nine
features off static-only data. What *remains* static is the `FALLBACK_*`
constant inside each feature's `data.ts`: intentionally kept as the
degraded-mode content, not a leftover. Two related things stayed
unchanged on purpose:

- **`ProjectsSectionContent` and `SkillsSectionContent`-style section
  copy** (labels/titles/subtitles for each section) are still plain
  static objects, not database rows — Phase 5.2's schema doesn't have a
  place for them (only `Hero`/`About`/`Resume`/`ContactInformation` model
  their section's copy as singleton rows; `Project`/`SkillCategory`/etc.
  don't have a parallel "section content" row). Moving these is a schema
  question for a future phase, not something this phase's brief asked for.
- **`SITE` config** (`src/config/site.config.ts` — name, email, resume
  path, GitHub/LinkedIn URLs) is still the single source these values are
  authored in; the seed script reads `SITE` (via each feature's fallback
  constant) to populate the DB once, not the other way around. Editing
  contact/social info going forward means editing the `ContactInformation`/
  `SocialLink` rows (e.g. via `prisma studio`), not `SITE` — but `SITE`
  itself wasn't in this phase's scope to remove.

## Future migration plan

- **Caching.** Wrap each feature's Prisma query in `unstable_cache` (or
  Next's `"use cache"` once stable) keyed by a per-feature tag, invalidated
  by a future admin write — the `withDbFallback` boundary is already
  exactly where that wrapping would go.
- **Admin writes.** Once an admin dashboard exists, each feature's
  `data.ts` gains sibling `create`/`update` functions; the `FALLBACK_*`
  constants and `withDbFallback` error handling need no changes.
- **Section content in the DB.** If section-level copy (labels/titles)
  ever needs to be admin-editable, it needs its own schema decision
  (e.g. a generic `SectionContent` table keyed by section name, or
  promoting each section's content into its main singleton row) —
  deliberately deferred, not decided here.
- **`prisma.config.ts` migration.** `npx prisma db seed` currently warns
  that the `package.json#prisma.seed` field is deprecated in favor of a
  `prisma.config.ts` file, removed entirely in Prisma 7. Phase 5.1 already
  decided to stay pinned to Prisma 6.x, so this is a no-op today and worth
  revisiting only alongside that eventual major-version upgrade.

## Verification performed

- `npx prisma db seed` — succeeds, idempotent (re-run twice, same result).
- Row counts verified against expected content counts (see above) — exact
  match.
- `npm run typecheck` — zero errors.
- `npm run lint` — zero errors/warnings.
- `npm run build` — succeeds; homepage and all 4 real project case-study
  pages statically prerender, meaning every migrated query succeeded live
  against Neon at build time.
- A temporary deep-equal script compared every migrated getter's live
  database output against its `FALLBACK_*` constant. Every feature matched
  exactly except two intentional, harmless differences: `Project.isPlaceholder`
  is now an explicit `false` instead of an omitted key (every call site
  already treats both identically — grepped and confirmed no strict-equality
  checks anywhere), and `JourneyStep.id` values are now DB-generated
  `cuid()`s instead of the old hand-picked slugs (confirmed used only as a
  React `key`, never as content).
- `withDbFallback` exercised directly with a thrown error, an empty array,
  a `null` result, and a successful result — all four behaved correctly
  with the expected labeled log output.
- `prisma studio` (`npm run prisma:studio`) is available for manual visual
  inspection of the seeded rows but wasn't required for the checks above.
