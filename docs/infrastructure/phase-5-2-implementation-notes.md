# Phase 5.2 Implementation Notes — Core Portfolio Schema

> Companion to [`docs/architecture/domain-model.md`](../architecture/domain-model.md)
> and [`database-design.md`](../architecture/database-design.md). Those
> documents design the **full**, eventual content model (Users, Media, Blog,
> Analytics, AI, Audit, Draft/Publish — every context). This phase's brief
> scoped a deliberately smaller slice — twelve entities representing only
> today's public portfolio content — so this document records exactly where
> that smaller schema folds a full-architecture entity into a field on one
> of the twelve, and why each fold is safe.

## What this phase built

- `prisma/schema.prisma` — 12 models, 4 enums, all indexes/constraints/cascade
  rules below. Zero seed data, zero repositories, zero CRUD, zero frontend
  changes — exactly as scoped.
- `prisma/migrations/20260709192914_core_portfolio_schema/migration.sql` —
  the initial migration, applied live against the Neon database.

## The 12 models

| Model | Represents | Kind |
|---|---|---|
| `Hero` | Hero section copy (today's `hero/data.ts`) | Singleton content |
| `About` | About section copy (`about/data.ts`) | Singleton content |
| `Resume` | Resume/CV section copy (`resume/data.ts`) | Singleton content |
| `ContactInformation` | Contact section copy (`contact/data.ts`) | Singleton content |
| `SocialLink` | One contact channel card (GitHub/LinkedIn/Email/Location) | Child of `ContactInformation` |
| `Technology` | A canonical tool/language/framework — the shared source of truth | Lookup entity |
| `Project` | A showcased project | Content entity |
| `ProjectTechnology` | Join: which `Technology` rows a `Project` uses, ordered | Join table |
| `SkillCategory` | A skills-section grouping (Programming, AI/ML, …) | Content entity |
| `Skill` | Join: which `Technology` rows a `SkillCategory` includes, ordered | Join table |
| `Education` | An academic entry | Content entity |
| `Certification` | A completed certification | Content entity |

### Singleton content tables (`Hero`, `About`, `Resume`, `ContactInformation`)

Each represents exactly one section's editable copy, not a list. Per
`domain-model.md §12`'s `HeroContent`/`SiteSettings` precedent, "exactly one
row" is enforced at the **application layer** (a future `data.ts` calling
`findFirst`, never `findMany`), not a DB constraint — a unique constraint on
a constant column is a common trick but adds no real safety a disciplined
query layer doesn't already provide, and the architecture docs use the same
reasoning for `ResumeVersion.isActive` (`database-design.md §7`).

### Why `Technology` is still the centerpiece, unchanged from the full design

`domain-model.md §4.1`'s reasoning — one shared entity instead of
`Project.techStack: string[]` duplicating `SkillItem { name, logo }` — is
the single normalization this phase absolutely could not drop, since it's
the whole point of "prepare for a CMS": renaming "Google Gemini" → "Gemini
API" is now a one-row update instead of a find-and-replace across two
static files. `Technology` is referenced by both `Project` (via
`ProjectTechnology`) and `SkillCategory` (via `Skill`) exactly as designed.

## Every relationship

| From | Relationship | To | Cardinality | Cascade |
|---|---|---|---|---|
| `Project` | uses | `Technology` (via `ProjectTechnology`) | N─M | Both sides `CASCADE` |
| `SkillCategory` | groups | `Technology` (via `Skill`) | N─M | Both sides `CASCADE` |
| `ContactInformation` | has | `SocialLink` | 1─N | `CASCADE` from parent |

Only three relationships exist in this phase — deliberately few, since
`Category`, `ProjectMetric`, `ProjectLink`, `Media`, and `Issuer` (which
would add `Project ─ Category`, `Project ─ ProjectMetric`, `Project ─
ProjectLink`, `Certificate ─ Issuer`, and several `─ Media` relationships in
the full design) aren't part of this phase's allowed entity list — see
"Deviations" below for exactly how each one is represented instead.

### Cascade reasoning

Both join tables (`ProjectTechnology`, `Skill`) cascade on **either** side —
deleting a `Project`, a `SkillCategory`, or even a shared `Technology`
removes the now-meaningless join rows with it. This follows
`database-design.md §4`'s stated rule ("hard-deleting cascades to child
rows that have no independent meaning without their parent") applied
symmetrically: a `ProjectTechnology` row means nothing if *either* the
project or the technology it names disappears, so both foreign keys use
`onDelete: Cascade` rather than picking one side as "the" parent.
`SocialLink → ContactInformation` cascades one-directionally since
`SocialLink` has no other parent it could belong to.

## Every index

- **Unique, implicitly indexed:** `Technology.name`, `Technology.slug`,
  `Project.slug`, `SkillCategory.title` — each is a primary public lookup
  key or a "no duplicates" invariant.
- **Unique compound:** `ProjectTechnology(projectId, technologyId)`,
  `Skill(skillCategoryId, technologyId)`, `SocialLink(contactInformationId,
  icon)` — each prevents a real duplicate the current static data already
  never has (a project listing the same tech twice, a category listing the
  same tech twice, two GitHub cards on one contact record).
- **Plain indexes for the Orderable pattern:** `Project.order`,
  `SkillCategory.order`, `Education.order`, `Certification.order`, plus the
  compound `(parentId, order)` pairs on `ProjectTechnology`, `Skill`, and
  `SocialLink` — every one of these tables' primary query is "give me this
  parent's children, sorted," so the index matches the query shape exactly
  (`database-design.md §10`).
- **`Project.featured`** — the homepage's "get the one featured project"
  query.
- **`Education.type`** — the school/college filter the timeline UI applies.
- **Foreign-key columns** (`SocialLink.contactInformationId`,
  `ProjectTechnology.projectId`/`technologyId`, `Skill.skillCategoryId`/
  `technologyId`) are indexed automatically by Prisma for every relation
  scalar — no explicit `@@index` needed for these beyond the compound ones
  above.

## Every constraint

- **Primary keys** — every model uses a `String @id @default(cuid())`,
  consistent across all 12 tables (no mixed integer/UUID/cuid schemes to
  reconcile later).
- **Foreign keys** — the three relationships in the table above, all
  `NOT NULL` (a `SocialLink` can't exist without its `ContactInformation`;
  a join row can't exist without both sides).
- **Enums** — `AccentColor` (shared token, mirrors `src/shared/types/common.ts`),
  `SkillIcon` (mirrors `SkillGroupIcon`), `EducationType`, `SocialLinkIcon`
  (mirrors `ContactMethodIcon`). Each is a genuinely small, closed set in
  the current UI — a real database enum, not a free-text column, so an
  invalid value is rejected at the DB level, not just by a TypeScript type
  that a raw SQL insert could bypass.
- **Required vs. optional** — matched field-by-field against each feature's
  existing `types.ts` (`HeroData`, `AboutData`, `Project`, `EducationEntry`,
  `Certification`, `ResumeData`, `ContactInfo`, `ContactMethod`). Notable
  judgment calls:
  - `Certification.completionDate` and `Certification.providerLogo` are
    nullable — the existing static data already uses `null`/omission for
    "not applicable," so the schema matches rather than inventing a
    sentinel value.
  - `Project.github`/`Project.liveDemo` are nullable, not
    required-but-sometimes-empty-string — the placeholder project's
    `github: ''` in today's static data is normalized to `null` on write,
    since "no link" and "" are the same real-world fact and only one of
    them should be representable.
- **Timestamps** — every model has `createdAt` (`@default(now())`) and
  `updatedAt` (`@updatedAt`, auto-maintained by Prisma on every write), with
  no exceptions, including the two pure join tables — applied uniformly
  per the phase brief's explicit requirement, even though a join row's
  `updatedAt` will rarely change after creation today.

## Deviations from the architecture — every fold, named

`domain-model.md`/`database-design.md` model five entities this phase's
brief doesn't list: `Category`, `ProjectMetric`, `ProjectLink`, `Media`,
`Issuer`. None are silently dropped — each is represented as a field on the
nearest allowed entity, and each fold is reversible (a later phase can
extract any of these into its own table via a normal migration, backfilling
from the existing column):

| Full-architecture entity | Where it went in this phase | Why the fold is safe now |
|---|---|---|
| `Category` | `Project.category: String` (free text) | Today's "category" values (e.g. "Computer Vision") are descriptive taglines, not a small shared enum every project must pick from — there's no cross-project "browse by category" query yet that a normalized table would serve. |
| `ProjectMetric` | `Project.metrics: Json?` | A metric is a simple `{label, value}` pair, always edited as part of one project, never queried/aggregated independently — exactly the two properties `Hero.interestCards`/`Hero.ctas` also share, which is why those are JSON too. |
| `ProjectLink` | `Project.github` / `liveDemo` / `demoLabel` / `demoHref` (scalar columns) | Only three link "slots" exist in the current UI (GitHub, live demo, optional secondary demo) — `ProjectLink`'s value is generalizing to an *arbitrary number* of link types without a migration, which isn't a need this phase's static data has yet. `caseStudy` — the fourth field `ProjectLink` also generalizes — is dropped entirely rather than folded anywhere: it was always exactly `/projects/${slug}` in every existing row, so it's 100% derivable and storing it would violate 3NF for no benefit. |
| `Media` | Plain `String` URL/path columns (`Hero.profileImage`, `Project.screenshot`, `Certification.image`, `Resume.previewImage`, …) | No Media Library, no Cloudinary integration exists yet in this phase — a `mediaId` foreign key into a table that doesn't exist isn't possible. A bare path/URL is exactly what every one of these fields already is in the current static `data.ts` files. |
| `Issuer` | `Certification.provider` / `providerLogo` (scalar columns) | `Issuer`'s 3NF win is real (today's static data even duplicates `providerLogo` per certificate, which `database-design.md §1` calls out directly) but this phase's ~10 certifications share only 2–3 real issuers — the duplication cost is negligible at this scale, and extracting `Issuer` later is a mechanical follow-up migration, not a redesign. |

Everything else — every entity that *is* in the phase's allowed list, every
field's required/optional/enum shape, every index and cascade rule — follows
`domain-model.md`/`database-design.md` directly with no further deviation.

## Migration summary

```
npx prisma validate        →  schema valid
npx prisma migrate dev --name core_portfolio_schema
                            →  applied 20260709192914_core_portfolio_schema
                               "Your database is now in sync with your schema."
npx prisma generate        →  PrismaClient regenerated; all 12 model
                               delegates (hero, about, resume,
                               contactInformation, socialLink, technology,
                               project, projectTechnology, skillCategory,
                               skill, education, certification) confirmed
                               present via a direct require() check.
```

Live verification against Neon after migrating:

```js
await prisma.hero.count()        // 0
await prisma.project.count()     // 0
await prisma.technology.count()  // 0
await prisma.socialLink.count()  // 0
```

All four resolve without error against the real, now-migrated tables — no
seed data, as scoped.

### The recurring Windows `EPERM` on `prisma generate`

Every `prisma generate`/`migrate dev` invocation in this session printed:

```
EPERM: operation not permitted, rename ...query_engine-windows.dll.node.tmpXXXX
  -> ...query_engine-windows.dll.node
```

— the same issue flagged as intermittent in
`phase-5-1-implementation-notes.md §6`, but this time reproducing on
**every** attempt, including after fully deleting `node_modules/.prisma`
and letting the engine re-download from scratch. Despite the printed error,
each run's actual output was verified correct — the query engine binary
was present and loadable, and (more importantly) the generated
`node_modules/.prisma/client/index.js` correctly exposed all 12 new model
delegates every time, confirmed with a direct `require('@prisma/client')`
check rather than trusting the CLI's exit code alone. The failure is
Prisma's installer failing a redundant re-verify/re-place step on an
already-correctly-written binary — consistent with a file-system watcher
(antivirus real-time protection is the most likely candidate) transiently
locking freshly-written `.dll.node` files on this machine. `prisma migrate
dev` itself — the step that actually matters, since it talks to Neon, not
the local filesystem — succeeded cleanly with exit code 0 every time.

## Future extensibility

- **Blog/Research, Users/RBAC, Media Library, Analytics, AI/Embeddings,
  Audit/Versioning, Draft-Publish** — every context `domain-model.md`
  describes beyond this phase's 12 entities can be added as pure
  `CREATE TABLE ...` migrations. Nothing in this phase's schema needs to be
  restructured to make room for them; `Technology`, in particular, already
  has the exact shape a future `ResearchProject`/`BlogPost` tech-tagging
  feature would reuse unchanged.
- **Extracting `Category`, `ProjectMetric`, `ProjectLink`, `Issuer` later**
  — each is a mechanical, additive migration: create the new table, backfill
  it by parsing the existing scalar/JSON column, then drop the old column.
  None require touching unrelated tables.
- **Wiring in `Media`** — once a Media Library exists, every `String` path
  column named above becomes a nullable `mediaId` foreign key alongside
  (not instead of) the existing column during a transition window, then the
  old column drops once every row has been backfilled.
- **A repository/data-access layer reading these tables** — deliberately
  not built this phase (per the brief). The natural next step is swapping
  each feature's `getX()` function body in `src/features/portfolio/*/data.ts`
  from `return staticArray` to a `prisma.x.findMany()` call, one feature at
  a time, with the existing TypeScript `types.ts` shapes acting as the
  contract both the static data and the future Prisma queries must satisfy.

## What was intentionally NOT done (per the brief)

- No seed data — every table is live in Neon and empty.
- No CRUD, no repositories, no Server Actions.
- No frontend changes — every feature's UI still reads from its static
  `data.ts`; this phase only proves the database side is ready to receive
  that data once a later phase wires it up.
- No entities beyond the 12 listed, and no Blog/Users/Roles/Permissions/
  Messages/Analytics/Audit/AI/Embeddings/Media/Version-History/Drafts/
  Publishing, exactly as scoped.
