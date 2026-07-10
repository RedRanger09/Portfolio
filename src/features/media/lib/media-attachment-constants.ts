/**
 * Shared MediaAttachment conventions — reusable by Projects, Blog, etc.
 * Keep attachable type/role strings stable; they are stored in Postgres.
 */

export const MEDIA_ATTACHABLE_TYPE = {
  PROJECT: 'Project',
  BLOG_POST: 'BlogPost',
  CERTIFICATION: 'Certification',
  HERO: 'Hero',
  ABOUT: 'About',
} as const

export type MediaAttachableType = (typeof MEDIA_ATTACHABLE_TYPE)[keyof typeof MEDIA_ATTACHABLE_TYPE]

export const MEDIA_ATTACHMENT_ROLE = {
  GALLERY: 'gallery',
} as const

export type MediaAttachmentRole = (typeof MEDIA_ATTACHMENT_ROLE)[keyof typeof MEDIA_ATTACHMENT_ROLE]
