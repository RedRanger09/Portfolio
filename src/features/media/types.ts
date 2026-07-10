import type { MediaProvider, MediaType } from '@prisma/client'

/** Serializable media asset returned from mutations and admin reads. */
export interface MediaAsset {
  id: string
  publicId: string | null
  url: string
  secureUrl: string | null
  provider: MediaProvider
  type: MediaType
  folder: string
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
  altText: string | null
  uploadedByEmail: string | null
  createdAt: string
  updatedAt: string
}

/** Value shape consumed by CMS upload fields. */
export interface MediaFieldValue {
  mediaId: string | null
  url: string
  altText?: string
}

/** Ordered gallery item backed by `MediaAttachment` + `Media`. */
export interface MediaGalleryItem {
  attachmentId: string
  mediaId: string
  src: string
  caption: string
  altText: string
  order: number
}

export const EMPTY_MEDIA_FIELD_VALUE: MediaFieldValue = {
  mediaId: null,
  url: '',
}

/** Logical folder keys shared by every CMS module. */
export type MediaFolderKey =
  | 'projects'
  | 'certificates'
  | 'blog'
  | 'resume'
  | 'avatars'
  | 'hero'
  | 'about'
