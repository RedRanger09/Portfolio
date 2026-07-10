# Project Screenshot Gallery

Completes MediaAttachment-backed project galleries using the existing Cloudinary media stack.

## Folder changes

```
prisma/migrations/20260710212216_add_media_attachment_caption/

src/features/media/
├─ types.ts                              + MediaGalleryItem
├─ lib/media-attachment-constants.ts     NEW — attachable types / roles
└─ lib/media-attachments.ts              NEW — list/attach/update/reorder/detach

src/features/portfolio/projects/
├─ lib/project-gallery.ts                NEW — sync denormalized Project.gallery JSON
├─ schemas/project-gallery.schema.ts     NEW
├─ actions/add|replace|update|reorder|remove-project-gallery-*.ts
├─ data.ts                               Prefer MediaAttachment; JSON fallback
└─ components/project-gallery.tsx        alt text + semantic list

src/features/admin/projects/
├─ components/project-gallery-editor.tsx NEW
├─ components/project-editor.tsx         Gallery section below thumbnail
└─ data.ts                               getProjectGalleryForAdmin()
```

## Database

Additive only: `MediaAttachment.caption String?`

No `ProjectScreenshot` table. Gallery rows use `attachableType=Project`, `role=gallery`.

## Upload flow

1. Admin uploads file → existing `uploadMediaAsset` (Cloudinary + Media row)
2. `attachMediaToEntity` creates MediaAttachment
3. `syncProjectGalleryJson` rewrites denormalized `Project.gallery` for legacy readers

Replace/delete/reorder follow the same shared helpers.
