import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { MutationNotFoundError, MutationValidationError } from '@/lib/mutation-result'
import { resolveMediaUrl } from './resolve-media-url'
import type { MediaGalleryItem } from '../types'
import {
  MEDIA_ATTACHMENT_ROLE,
  MEDIA_ATTACHABLE_TYPE,
  type MediaAttachableType,
  type MediaAttachmentRole,
} from './media-attachment-constants'

export type { MediaGalleryItem }

const GALLERY_INCLUDE = {
  media: {
    select: {
      id: true,
      url: true,
      secureUrl: true,
      altText: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.MediaAttachmentInclude

type GalleryAttachmentRow = Prisma.MediaAttachmentGetPayload<{ include: typeof GALLERY_INCLUDE }>

function mapGalleryAttachment(row: GalleryAttachmentRow): MediaGalleryItem | null {
  if (row.media.deletedAt) return null

  return {
    attachmentId: row.id,
    mediaId: row.mediaId,
    src: resolveMediaUrl(row.media, ''),
    caption: row.caption?.trim() || '',
    altText: row.media.altText?.trim() || row.caption?.trim() || 'Screenshot',
    order: row.order,
  }
}

/** Loads ordered gallery attachments for one or many attachable records. */
export async function listMediaGalleryItems(params: {
  attachableType: MediaAttachableType
  attachableIds: string[]
  role?: MediaAttachmentRole
}): Promise<Map<string, MediaGalleryItem[]>> {
  const role = params.role ?? MEDIA_ATTACHMENT_ROLE.GALLERY
  const result = new Map<string, MediaGalleryItem[]>()

  for (const id of params.attachableIds) {
    result.set(id, [])
  }

  if (params.attachableIds.length === 0) return result

  const rows = await prisma.mediaAttachment.findMany({
    where: {
      attachableType: params.attachableType,
      attachableId: { in: params.attachableIds },
      role,
      media: { deletedAt: null },
    },
    include: GALLERY_INCLUDE,
    orderBy: { order: 'asc' },
  })

  for (const row of rows) {
    const item = mapGalleryAttachment(row)
    if (!item) continue
    const list = result.get(row.attachableId) ?? []
    list.push(item)
    result.set(row.attachableId, list)
  }

  return result
}

export async function listProjectGalleryItems(projectId: string): Promise<MediaGalleryItem[]> {
  const map = await listMediaGalleryItems({
    attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
    attachableIds: [projectId],
  })
  return map.get(projectId) ?? []
}

export interface AttachMediaParams {
  mediaId: string
  attachableType: MediaAttachableType
  attachableId: string
  role?: MediaAttachmentRole
  caption?: string
  order?: number
}

/** Creates a MediaAttachment row at the end of the gallery (or at `order`). */
export async function attachMediaToEntity(params: AttachMediaParams): Promise<MediaGalleryItem> {
  const role = params.role ?? MEDIA_ATTACHMENT_ROLE.GALLERY

  const media = await prisma.media.findFirst({
    where: { id: params.mediaId, deletedAt: null },
    select: { id: true, url: true, secureUrl: true, altText: true },
  })

  if (!media) {
    throw new MutationNotFoundError(`Media "${params.mediaId}" does not exist.`)
  }

  const existing = await prisma.mediaAttachment.findUnique({
    where: {
      mediaId_attachableType_attachableId_role: {
        mediaId: params.mediaId,
        attachableType: params.attachableType,
        attachableId: params.attachableId,
        role,
      },
    },
  })

  if (existing) {
    throw new MutationValidationError({
      mediaId: ['This image is already in the gallery.'],
    })
  }

  const maxOrder = await prisma.mediaAttachment.aggregate({
    where: {
      attachableType: params.attachableType,
      attachableId: params.attachableId,
      role,
    },
    _max: { order: true },
  })

  const order = params.order ?? (maxOrder._max.order ?? -1) + 1

  const created = await prisma.mediaAttachment.create({
    data: {
      mediaId: params.mediaId,
      attachableType: params.attachableType,
      attachableId: params.attachableId,
      role,
      caption: params.caption?.trim() || null,
      order,
    },
    include: GALLERY_INCLUDE,
  })

  const mapped = mapGalleryAttachment(created)
  if (!mapped) {
    throw new MutationNotFoundError('Attached media is unavailable.')
  }

  return mapped
}

/** Updates caption on the attachment and optional alt text on the Media row. */
export async function updateMediaGalleryItem(params: {
  attachmentId: string
  caption?: string
  altText?: string | null
}): Promise<MediaGalleryItem> {
  const existing = await prisma.mediaAttachment.findUnique({
    where: { id: params.attachmentId },
    include: GALLERY_INCLUDE,
  })

  if (!existing || existing.media.deletedAt) {
    throw new MutationNotFoundError(`Gallery item "${params.attachmentId}" does not exist.`)
  }

  if (params.altText !== undefined) {
    await prisma.media.update({
      where: { id: existing.mediaId },
      data: { altText: params.altText?.trim() || null },
    })
  }

  const updated = await prisma.mediaAttachment.update({
    where: { id: params.attachmentId },
    data: {
      ...(params.caption !== undefined ? { caption: params.caption.trim() || null } : {}),
    },
    include: GALLERY_INCLUDE,
  })

  const mapped = mapGalleryAttachment(updated)
  if (!mapped) {
    throw new MutationNotFoundError('Gallery item media is unavailable.')
  }

  return mapped
}

/** Persists a new order for gallery attachments belonging to one entity. */
export async function reorderMediaGalleryItems(params: {
  attachableType: MediaAttachableType
  attachableId: string
  attachmentIds: string[]
  role?: MediaAttachmentRole
}): Promise<MediaGalleryItem[]> {
  const role = params.role ?? MEDIA_ATTACHMENT_ROLE.GALLERY

  const existing = await prisma.mediaAttachment.findMany({
    where: {
      attachableType: params.attachableType,
      attachableId: params.attachableId,
      role,
    },
    select: { id: true },
  })

  const existingIds = new Set(existing.map((row) => row.id))
  if (
    params.attachmentIds.length !== existingIds.size ||
    params.attachmentIds.some((id) => !existingIds.has(id))
  ) {
    throw new MutationValidationError({
      attachmentIds: ['Gallery order must include every current screenshot exactly once.'],
    })
  }

  await prisma.$transaction(
    params.attachmentIds.map((id, index) =>
      prisma.mediaAttachment.update({
        where: { id },
        data: { order: index },
      }),
    ),
  )

  const map = await listMediaGalleryItems({
    attachableType: params.attachableType,
    attachableIds: [params.attachableId],
    role,
  })

  return map.get(params.attachableId) ?? []
}

/** Detaches a gallery item. Soft-deletes the Media row when nothing else references it. */
export async function detachMediaGalleryItem(attachmentId: string): Promise<{ id: string }> {
  const existing = await prisma.mediaAttachment.findUnique({
    where: { id: attachmentId },
    select: {
      id: true,
      mediaId: true,
      attachableType: true,
      attachableId: true,
      role: true,
    },
  })

  if (!existing) {
    throw new MutationNotFoundError(`Gallery item "${attachmentId}" does not exist.`)
  }

  await prisma.mediaAttachment.delete({ where: { id: attachmentId } })

  const [projectCount, attachmentCount, blogCount, settingsCount] = await Promise.all([
    prisma.project.count({ where: { screenshotMediaId: existing.mediaId } }),
    prisma.mediaAttachment.count({ where: { mediaId: existing.mediaId } }),
    prisma.blogPost.count({ where: { featuredImageMediaId: existing.mediaId } }),
    prisma.siteSettings.count({ where: { ogImageMediaId: existing.mediaId } }),
  ])

  if (projectCount + attachmentCount + blogCount + settingsCount === 0) {
    await prisma.media.update({
      where: { id: existing.mediaId },
      data: { deletedAt: new Date() },
    })
  }

  return { id: attachmentId }
}

/** Denormalized `{ src, caption }` snapshot for legacy `Project.gallery` JSON. */
export function galleryItemsToJsonSnapshot(items: MediaGalleryItem[]): Array<{ src: string; caption: string }> {
  return items.map((item) => ({
    src: item.src,
    caption: item.caption || item.altText,
  }))
}
