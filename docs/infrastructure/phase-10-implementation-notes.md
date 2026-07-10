# Phase 10 Implementation Notes — Complete Content CMS

Phase 8 delivered Projects as the reference CMS module. Phase 9 added media
infrastructure. This phase completes the remaining portfolio content admin
modules by mirroring the Projects architecture exactly.

## Folder changes

```
src/features/admin/
├─ shared/
│  ├─ apply-field-errors.ts          NEW — MutationResult → field errors
│  ├─ string-list-field.tsx            NEW — ordered string array editor
│  └─ technology-suggestions.ts        NEW — shared tech datalist query
├─ hero/          data.ts, types.ts, components/hero-editor.tsx
├─ about/         data.ts, types.ts, components/about-editor.tsx
├─ contact/       data.ts, types.ts, components/contact-editor.tsx
├─ resume/        data.ts, types.ts, components/resume-editor.tsx
├─ journey/       list + editor + routes (collection)
├─ skills/        list + editor + routes (collection)
├─ education/     list + editor + routes (collection)
└─ certifications/ list + editor + routes (collection)

src/app/admin/
├─ hero/page.tsx           (singleton editor)
├─ about/page.tsx
├─ contact/page.tsx
├─ resume/page.tsx
├─ journey/**              list + new + [id]
├─ skills/**
├─ education/**
└─ certifications/**
```

## CMS architecture

Every module follows the Projects reference:

```
app/admin/<module>/*     Server Components → features/admin/<module>/data.ts
  ↓
components/*             Client editors/lists (interaction only)
  ↓
features/portfolio/<module>/actions/*   Existing Server Actions
  ↓
Prisma
```

**Singleton modules** (Hero, About, Resume, Contact): single `/admin/<module>` page with an editor; `update*` actions upsert the one row.

**Collection modules** (Journey, Skills, Education, Certifications): list + `new` + `[id]` routes; full create/update/delete via existing actions.

## Reused abstractions

From Projects CMS and Phase 8/9 shared layer:

- `SectionTitle`, `AdminCard`, `AdminField`, `AdminTextInput`, `AdminTextarea`
- `AdminBadge`, `AdminSearchInput`, `AdminPagination`, `AdminConfirmDialog`
- `EmptyState`, `LoadingCard`
- `applyFieldErrors`, `StringListField`
- `MediaUploadField` (Hero profile, Resume preview, Certification image, Projects thumbnail)
- `getTechnologyNamesForAdmin` (Projects + Skills)
- `MutationResult` + existing Zod schemas + `assertAdminAccess`

## New abstractions

Only abstractions that emerged across multiple modules:

| Abstraction | Used by |
|---|---|
| `applyFieldErrors` | All editors |
| `StringListField` | About, Hero cards, Journey, Education |
| `technology-suggestions.ts` | Projects, Skills |

No parallel upload, table, or mutation systems were introduced.

## Validation strategy

Unchanged from Phase 5.4/8:

- Zod schemas in `features/portfolio/<module>/schemas/`
- `runMutation()` normalizes errors to `MutationResult`
- Editors call `applyFieldErrors` for `VALIDATION` field errors
- Contact retains unique-icon refine in schema

## Media integration

| Module | Field | Folder |
|---|---|---|
| Hero | Profile image | `hero` |
| Resume | Preview image | `resume` |
| Certifications | Certificate image | `certificates` |
| Projects | Thumbnail | `projects` (Phase 8) |

PDF path (`Resume.filePath`) remains a string path — PDF upload is a future media type extension.

## Query strategy

**Admin reads** live in `features/admin/<module>/data.ts`:

- Singletons: `findFirst` with includes where needed (Contact + social links)
- Collections: lean `select` for lists; full row (with joins for Skills) for editors

Public reads in `features/portfolio/<module>/data.ts` are unchanged.

## Performance considerations

- List queries select only display fields (no N+1 on collections except Skills `_count`)
- Client-side search/pagination on collection lists (same as Projects)
- Server Components fetch data; client components only for forms/tables
- Skills technology resolution stays in mutation transactions (unchanged)

## Future Blog compatibility

Blog can follow the same pattern:

- `features/admin/blog/data.ts` + list/editor components
- `features/portfolio/blog/actions/` (when built)
- `MediaUploadField` with `folder="blog"`
- `MediaAttachment` for inline images (schema already exists from Phase 9)

Section headings (`get*SectionContent()` static strings) remain hardcoded — a future phase can add `SiteSettings` or per-section config rows if admin-editable headings are needed.

## Production readiness

| Item | Status |
|---|---|
| All 8 content modules functional | ✅ |
| Placeholders replaced (Hero–Contact) | ✅ |
| Auth + mutations unchanged | ✅ |
| Media uploads where applicable | ✅ |
| `typecheck` / `lint` / `build` | ✅ |
| No schema migrations required | ✅ |
| Blog / Analytics / AI / Messages | Still placeholders (out of scope) |
