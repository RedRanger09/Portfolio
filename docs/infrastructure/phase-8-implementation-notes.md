# Phase 8 Implementation Notes — Projects CMS

Phase 7 secured the admin shell. This phase replaces the Projects placeholder
with the first fully functional CMS module — the reference implementation for
Hero, About, Skills, Journey, Education, Certifications, Resume, and Contact.

## Folder changes

```
src/
├─ features/admin/projects/
│  ├─ data.ts                              NEW — lean list + full editor reads
│  ├─ types.ts                             NEW — list/editor types + mappers
│  ├─ index.ts                             NEW — feature barrel
│  └─ components/
│     ├─ projects-admin-list.tsx           NEW — search/sort/filter/table/pagination
│     ├─ project-editor.tsx                NEW — reusable create/edit form
│     ├─ project-row-actions.tsx           NEW — toggles, preview, duplicate, delete
│     └─ index.ts
├─ features/admin/shared/
│  ├─ admin-badge.tsx                      NEW — status pills
│  ├─ admin-search-input.tsx               NEW — list search field
│  ├─ admin-pagination.tsx               NEW — client pagination + AdminSelect
│  ├─ admin-field.tsx                      NEW — field chrome + confirm dialog
│  └─ index.ts                             MODIFIED — export new primitives
├─ features/portfolio/projects/
│  ├─ lib/project-slug.ts                  NEW — slugify, uniqueness, duplicate slug
│  ├─ schemas/project.schema.ts            MODIFIED — URL/image limits, duplicate schema
│  └─ actions/
│     ├─ duplicate-project.ts              NEW — clone with new slug
│     ├─ create-project.ts                 MODIFIED — slug uniqueness check
│     ├─ update-project.ts                 MODIFIED — slug uniqueness on change
│     └─ index.ts                          MODIFIED — export duplicateProject
├─ lib/mutation-result.ts                  MODIFIED — MutationValidationError
└─ app/admin/projects/
   ├─ page.tsx                              MODIFIED — real list (was ModulePlaceholder)
   ├─ loading.tsx                           NEW
   ├─ new/page.tsx                          NEW — create route
   └─ [id]/
      ├─ page.tsx                           NEW — edit route
      └─ loading.tsx                         NEW
```

## Project CMS architecture

```
app/admin/projects/*          Server Components — fetch via admin/projects/data.ts
  ↓
features/admin/projects/components/*   Client Components — interaction only
  ↓
features/portfolio/projects/actions/*  Server Actions — assertAdminAccess + runMutation
  ↓
Prisma (transactions where needed)
```

**Reads split by surface:**

| Surface | Module | Query |
|---|---|---|
| Public portfolio | `features/portfolio/projects/data.ts` | Full `PROJECT_INCLUDE` |
| Admin list | `features/admin/projects/data.ts` | Lean `select` (no joins) |
| Admin editor | `features/admin/projects/data.ts` | Full row via `PROJECT_INCLUDE` |

Admin reads live under `features/admin/projects/` — not in the portfolio
feature barrel — so public imports never pull admin-only query shapes.

## Form architecture

`ProjectEditor` is a client component accepting:

- `mode: 'create' | 'edit'`
- `projectId?` (edit only)
- `initialValues: ProjectEditorValues`
- `technologySuggestions: string[]`

**Value flow:**

1. Editor holds local `ProjectEditorValues` state.
2. On submit, mappers in `types.ts` convert to `CreateProjectInput` /
   `UpdateProjectInput`.
3. Server Action returns `MutationResult<ProjectRow>`.
4. `VALIDATION` field errors map back to per-field UI; other errors show a
   form-level alert.
5. Success redirects to `/admin/projects/[id]` and calls `router.refresh()`.

**Slug behavior:** auto-generated from title on create until the slug field is
manually edited (`slugTouched` flag).

**Published mapping:** UI `published` ↔ database `isPlaceholder` inverted
(`published = !isPlaceholder`). No `published` column exists yet.

**Case study URL:** read-only derived field `/projects/${slug}` — not stored.

**Thumbnail:** text input for local `screenshot` path with inline preview;
same field accepts Cloudinary URLs later without schema changes.

## Validation strategy

| Layer | Responsibility |
|---|---|
| Zod (`project.schema.ts`) | Required fields, lengths, URL format, slug pattern, tech array |
| `assertUniqueProjectSlug()` | Business rule: slug uniqueness (throws `MutationValidationError`) |
| `runMutation()` | Normalizes Zod + business errors into `MutationResult` |

Client forms branch on `result.error.type === 'VALIDATION'` and map
`fieldErrors` to `AdminField` error props.

## Prisma query strategy

- **List:** `findMany({ select: ADMIN_PROJECT_LIST_SELECT })` — eight scalar
  fields, no `include`, no N+1.
- **Editor:** `findUnique({ include: PROJECT_INCLUDE })` — reuses portfolio
  feature's include shape for technology joins.
- **Technology suggestions:** `technology.findMany({ select: { name: true } })`.
- **Writes:** unchanged Phase 5.4 transaction patterns in create/update/
  duplicate actions.

## Mutation flow

```
Client form / row action
  → createProject | updateProject | deleteProject | duplicateProject
  → assertAdminAccess()
  → runMutation(schema, input, handler)
  → Zod safeParse
  → handler (Prisma transaction + audit placeholder)
  → MutationResult<T>
```

**Row-level partial updates** (featured/published toggles) call
`updateProject({ id, featured })` or `updateProject({ id, isPlaceholder })`
without resending the full form — safe because `updateProjectSchema` fields are
`.optional()` with no `.default()`.

**Duplicate:** clones full project + technologies with `{slug}-copy` suffix,
`featured: false`, name `"(Copy)"` appended.

## UI decisions

- **List page:** `SectionTitle` + "New project" CTA, search/filter/sort toolbar,
  responsive table with thumbnail, status badges, row actions.
- **Empty states:** global (no projects) vs filtered (no matches).
- **Pagination:** client-side with `ADMIN_PAGE_SIZE = 10`; chrome ready for
  server-driven paging later.
- **Optimistic UI:** featured/published toggles update local row state, revert
  on mutation failure.
- **Delete:** `AdminConfirmDialog` before `deleteProject`.
- **Preview:** links to `/projects/[slug]` only when published.
- **Loading:** module-level `loading.tsx` skeletons using `LoadingCard`.
- **Accessibility:** `role="alertdialog"`, `aria-pressed` on toggles,
  `motion-reduce:` on spinners.

## Reusable patterns introduced

| Pattern | Location | Purpose |
|---|---|---|
| `AdminBadge` | `shared/admin-badge.tsx` | Status pills (published, featured, etc.) |
| `AdminSearchInput` | `shared/admin-search-input.tsx` | List search |
| `AdminPagination` + `AdminSelect` | `shared/admin-pagination.tsx` | Pagination + filter/sort dropdowns |
| `AdminField` + inputs + dialog | `shared/admin-field.tsx` | Form fields + destructive confirm |
| `ProjectEditor` | `admin/projects/components/` | Reference CMS form |
| `types.ts` mappers | `admin/projects/types.ts` | Editor values ↔ mutation inputs |
| `applyFieldErrors` pattern | `project-editor.tsx` | MutationResult → field errors |
| `assertUniqueProjectSlug` | `portfolio/projects/lib/` | Slug business validation |

## What future CMS modules can reuse

1. **Route shape:** `app/admin/<module>/page.tsx` (list) +
   `new/page.tsx` + `[id]/page.tsx` + `loading.tsx`.
2. **Read split:** `features/admin/<module>/data.ts` for lean list + full
   editor queries.
3. **Types + mappers:** `AdminXListItem`, `XEditorValues`, empty defaults,
   `mapRowToEditorValues`, `mapEditorValuesToCreateInput`.
4. **Shared chrome:** `SectionTitle`, `AdminCard`, `EmptyState`, `AdminBadge`,
   `AdminSearchInput`, `AdminPagination`, `AdminSelect`, `AdminField`,
   `AdminConfirmDialog`.
5. **Client list component:** search → filter → sort → paginate → row actions.
6. **Mutation wiring:** import from `features/portfolio/<module>/actions`,
   never from the portfolio barrel; handle `MutationResult` consistently.
7. **Optimistic toggles:** local state patch + revert on failure.

Singleton modules (Hero, About, Contact) skip the list/table pattern and use
only the editor + single `update` action.

## Deviations from architecture

1. **Published = `!isPlaceholder`** — the schema has no `published` column.
   Admin UI exposes "Published" as a checkbox mapping to `isPlaceholder`.
   A future migration can add a dedicated column without changing the admin
   module shape.
2. **Simplified editor** — case study body fields (`overview`, `problem`,
   `metrics`, `gallery`, etc.) are not exposed in the UI. Create uses schema
   defaults; edit preserves existing values via partial update (only sent
   fields are written).
3. **`duplicateProject` action** — new mutation not in the original Phase 5.4
   inventory; follows the same `runMutation` pattern.

## Verification

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- Admin routes compile: `/admin/projects`, `/admin/projects/new`,
  `/admin/projects/[id]`
- Auth: unchanged Phase 7 middleware + `assertAdminAccess` in layout and actions
- Public portfolio: unchanged read layer; mutations invalidate via
  `router.refresh()` on admin saves
