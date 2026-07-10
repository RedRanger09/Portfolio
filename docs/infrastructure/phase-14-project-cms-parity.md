# Phase 14 — Project CMS ↔ Case Study parity

## Goal

Make the Project CMS the single source of truth for every section on the public Project Detail (case study) page. No hardcoded case-study content remains outside Prisma + seed fallbacks.

## Folder changes

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | Additive section titles + visibility booleans + `heroEyebrow` |
| `prisma/migrations/20260711033000_add_project_case_study_cms_fields/` | Migration with defaults preserving existing rows |
| `src/features/admin/shared/admin-collapsible-section.tsx` | Collapsible CMS cards |
| `src/features/admin/shared/string-list-field.tsx` | Optional reorder controls |
| `src/features/admin/projects/components/project-editor.tsx` | Full 12-section case-study editor |
| `src/features/admin/projects/types.ts` | Expanded `ProjectEditorValues` + mappers |
| `src/features/portfolio/projects/lib/youtube.ts` | Safe YouTube ID / embed URL parsing |
| `src/features/portfolio/projects/components/project-video-embed.tsx` | Accessible iframe embed |
| `src/features/portfolio/projects/components/project-detail.tsx` | Visibility + empty gates; split video vs live demo |
| `next.config.ts` | CSP `frame-src` allow-list for YouTube |

## Database

Additive only on `Project`:

- `heroEyebrow` (optional)
- Section title columns with string defaults matching prior UI copy
- `show*` booleans defaulting to `true` (backward compatible)

Reuses existing: `overview`, `problem`, list arrays, `metrics`, `demoLabel`/`demoHref`, `liveDemo`, `architectureImage`, `ragPipelineImage`, gallery via `MediaAttachment`.

## CMS architecture

Editor organized as collapsible cards (Basic → Hero → Overview → … → Live Demo). Each optional section has an inline visibility toggle. Gallery remains the existing attachment-based editor (embedded mode). Create/update still go through Zod + `runMutation` + `assertAdminAccess`.

## Query strategy

Unchanged: one `findUnique`/`findMany` with `PROJECT_INCLUDE` (technologies + screenshot media). Gallery loaded in a single batched `listMediaGalleryItems` call. No N+1.

## Visibility

Public `ProjectDetail` renders a section only when `showX === true` **and** content is non-empty. Disabled or empty sections are omitted from the DOM.

## Validation

Zod validates YouTube URLs (`youtube.com` / `youtu.be`), optional absolute URLs, list max lengths, and text lengths. Invalid YouTube URLs fail at the Server Action boundary.

## Media

Thumbnail + diagrams use `MediaUploadField` / Cloudinary. Gallery uses existing project gallery Server Actions (upload, replace, delete, reorder, caption, alt).

## YouTube

`demoHref` stores the watch URL. Public page embeds via `youtube-nocookie.com` only when a valid video ID is parsed. Non-YouTube or empty URLs hide the video section.

## Performance

Server Components for detail body; hero remains the sole client motion boundary. Embed uses `loading="lazy"`. No extra hydration for section lists.

## Production readiness

- Existing projects keep rendering (boolean defaults `true`)
- CSP updated for embeds
- TypeScript / ESLint / Next build should pass after migrate
