import type { Media } from '@prisma/client'
import type { MediaAsset } from '../types'

type MediaRowInput = Pick<
  Media,
  | 'id'
  | 'publicId'
  | 'url'
  | 'secureUrl'
  | 'provider'
  | 'type'
  | 'folder'
  | 'width'
  | 'height'
  | 'format'
  | 'bytes'
  | 'altText'
  | 'uploadedByEmail'
  | 'createdAt'
  | 'updatedAt'
>

/** Maps a Prisma `Media` row to the serializable admin/mutation shape. */
export function mapMediaRow(row: MediaRowInput): MediaAsset {
  return {
    id: row.id,
    publicId: row.publicId,
    url: row.url,
    secureUrl: row.secureUrl,
    provider: row.provider,
    type: row.type,
    folder: row.folder,
    width: row.width,
    height: row.height,
    format: row.format,
    bytes: row.bytes,
    altText: row.altText,
    uploadedByEmail: row.uploadedByEmail,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/** Prefers HTTPS Cloudinary URL, then HTTP URL, then a caller-provided fallback. */
export function resolveMediaUrl(
  media: Pick<Media, 'secureUrl' | 'url'> | null | undefined,
  fallback: string,
): string {
  return media?.secureUrl ?? media?.url ?? fallback
}
