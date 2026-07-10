# Phase 9 Implementation Notes — Media Infrastructure

Phase 8 delivered the Projects CMS with manual thumbnail paths. This phase
introduces reusable media infrastructure backed by Cloudinary and Postgres,
and integrates it into the Projects thumbnail field without redesigning the
CMS shell or mutation architecture.

## Folder changes

```
src/
├─ features/media/
│  ├─ types.ts
│  ├─ data.ts                              Admin media library reads
│  ├─ index.ts
│  ├─ schemas/media.schema.ts
│  ├─ lib/
│  │  ├─ media-folders.ts                  Environment-prefixed folder paths
│  │  ├─ media-validation.ts               MIME, size, dimension checks
│  │  ├─ media-service.ts                  Upload/replace/delete primitives
│  │  └─ resolve-media-url.ts              URL + row mappers
│  ├─ actions/
│  │  ├─ upload-media.ts
│  │  ├─ replace-media.ts
│  │  ├─ delete-media.ts
│  │  ├─ parse-form-metadata.ts
│  │  ├─ media-action-errors.ts
│  │  └─ index.ts
│  └─ components/
│     └─ media-upload-field.tsx            Reusable CMS upload widget
├─ features/admin/media/
│  └─ components/media-library-list.tsx
├─ features/portfolio/projects/
│  ├─ lib/project-screenshot.ts            Screenshot FK + URL resolution
│  ├─ schemas/project.schema.ts            + screenshotMediaId
│  └─ actions/create|update|duplicate-project.ts
├─ features/admin/projects/
│  ├─ types.ts                             + screenshotMediaId
│  └─ components/project-editor.tsx        MediaUploadField integration
├─ lib/cloudinary.ts                       Real Cloudinary SDK client
├─ app/admin/media/page.tsx                Live media library (was placeholder)
└─ prisma/migrations/20260710175300_add_media_infrastructure/

package.json                               + cloudinary, image-size
next.config.ts                             + res.cloudinary.com remote pattern
.env.example                               Cloudinary vars documented
```

## Cloudinary architecture

```
Client (MediaUploadField)
  → FormData → uploadMedia / replaceMedia Server Actions
  → assertAdminAccess()
  → validateImageUpload() (MIME magic bytes, size, dimensions)
  → uploadImageBuffer() in lib/cloudinary.ts (SDK, secrets server-only)
  → Cloudinary stores file in {env}/{folder} (e.g. dev/projects)
  → media-service creates/updates Media row in Postgres
  → MutationResult<MediaAsset> back to client
```

**Deviation from `database-and-storage.md §2.1`:** that doc describes
browser-direct signed uploads. This phase uses **fully server-side uploads**
per the phase brief ("Uploads must occur server-side"). Secrets never reach
the browser; file bytes pass through a Server Action instead of a signed
client POST. A future optimization can add signed direct uploads without
changing the `Media` schema or `media-service` interface.

## Upload flow

1. Admin selects a file in `MediaUploadField`.
2. Client builds `FormData` (`file`, `folder`, optional `altText`, optional `mediaId` for replace).
3. `uploadMedia` or `replaceMedia` validates metadata with Zod.
4. `validateImageUpload` checks magic bytes, 5 MB max, 4096×4096 max (SVG: size only).
5. `uploadMediaAsset` / `replaceMediaAsset` uploads via Cloudinary SDK.
6. Prisma `Media` row persisted with `publicId`, URLs, dimensions, `folder`, `uploadedByEmail`.
7. Client updates local `MediaFieldValue` (`mediaId` + `url`).
8. Project save sends `screenshotMediaId` + denormalized `screenshot` URL via existing project mutations.

## Validation strategy

| Layer | Checks |
|---|---|
| Browser `accept` | UX hint only (bypassable) |
| `validateImageUpload` | Magic-byte MIME, declared vs detected type, 5 MB, dimensions |
| Zod (`media.schema.ts`) | Folder key, alt text length, delete/replace ids |
| `softDeleteMediaAsset` | Rejects delete when `referenceCount > 0` |
| `resolveProjectScreenshotWrite` | Verifies `screenshotMediaId` resolves to a live media row |

## Database changes

**Additive migration** `20260710175300_add_media_infrastructure`:

- New enums: `MediaProvider`, `MediaType`
- New models: `Media`, `MediaAttachment`
- `Project.screenshotMediaId` optional FK → `Media` (`onDelete: SetNull`)
- **`Project.screenshot` retained** — seeded local paths (`/project-images/...`) unchanged
- No seed data rewrite required

## Media lifecycle

1. **Upload** — Cloudinary asset + `Media` row (`deletedAt = null`).
2. **Reference** — CMS modules link via direct FK (`Project.screenshotMediaId`) or future `MediaAttachment` rows.
3. **Replace** — New Cloudinary upload + new `Media` row; old row soft-deleted only when unreferenced.
4. **Soft delete** — `deleteMedia` sets `deletedAt`; asset hidden from library; Cloudinary file untouched.
5. **Hard delete** — deferred to a cron cleanup job per `database-and-storage.md §2.3` (not implemented in this phase).

## Reusable abstractions

| Abstraction | Purpose |
|---|---|
| `media-service.ts` | Core upload/replace/soft-delete/reference counting |
| `media-folders.ts` | `dev|preview|prod` + module folder paths |
| `media-validation.ts` | Shared server-side file validation |
| `MediaUploadField` | Drop-in CMS image field (upload/preview/replace/remove) |
| `MediaFieldValue` | Standard value shape for editor state |
| `uploadMedia` / `replaceMedia` / `deleteMedia` | Mutation-layer Server Actions |
| `resolveMediaUrl` | Public URL resolution with fallback |

## Future module integration

Any CMS module follows the same pattern:

1. Add optional `{slot}MediaId` FK on the entity (or use `MediaAttachment` for galleries).
2. Keep denormalized URL column during transition if needed.
3. Drop `<MediaUploadField folder="certificates" … />` into the editor.
4. Map editor values → create/update inputs including `mediaId`.
5. Resolve URL in the mutation handler before persist.

Folders already reserved: `projects`, `certificates`, `blog`, `resume`, `avatars`, `hero`, `about`.

## Production readiness

| Item | Status |
|---|---|
| Server-side uploads | ✅ |
| Secret isolation | ✅ API secret only in `lib/cloudinary.ts` |
| Validation | ✅ MIME, size, dimensions |
| Soft delete + reference guard | ✅ |
| Seeded content preserved | ✅ |
| `typecheck` / `lint` / `build` | ✅ |
| Cloudinary env required for uploads | ⚠️ Set `CLOUDINARY_*` in production |
| Hard-delete cron / reconciliation | 🔜 Future phase |
| Signed client-direct uploads | 🔜 Optional optimization |
| Migrate `public/project-images/*` to Cloudinary | 🔜 Content migration task |

**To enable uploads locally:** set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local`. Without them, the Projects editor still previews existing local thumbnails; upload buttons are disabled with a clear message.
