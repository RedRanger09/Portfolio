import 'server-only'

import { MutationNotFoundError, MutationValidationError } from '@/lib/mutation-result'
import { isCloudinaryConfigured, uploadImageBuffer } from '@/lib/cloudinary'
import { prisma } from '@/lib/prisma'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import type { MediaFolderKey } from '../types'
import { resolveMediaFolder } from './media-folders'
import { mapMediaRow } from './resolve-media-url'
import type { ValidatedUploadFile } from './media-validation'

async function countMediaReferences(mediaId: string): Promise<number> {
  const [projectCount, attachmentCount, blogCount, settingsCount] = await Promise.all([
    prisma.project.count({ where: { screenshotMediaId: mediaId } }),
    prisma.mediaAttachment.count({ where: { mediaId } }),
    prisma.blogPost.count({ where: { featuredImageMediaId: mediaId } }),
    prisma.siteSettings.count({ where: { ogImageMediaId: mediaId } }),
  ])

  return projectCount + attachmentCount + blogCount + settingsCount
}

export interface MediaUsageReference {
  type: string
  label: string
}

export async function getMediaUsageReferences(mediaId: string): Promise<MediaUsageReference[]> {
  const [projects, blogPosts, settings, attachments] = await Promise.all([
    prisma.project.findMany({ where: { screenshotMediaId: mediaId }, select: { name: true } }),
    prisma.blogPost.findMany({ where: { featuredImageMediaId: mediaId }, select: { title: true } }),
    prisma.siteSettings.findMany({ where: { ogImageMediaId: mediaId }, select: { id: true } }),
    prisma.mediaAttachment.count({ where: { mediaId } }),
  ])

  return [
    ...projects.map((p) => ({ type: 'Project', label: p.name })),
    ...blogPosts.map((p) => ({ type: 'Blog post', label: p.title })),
    ...settings.map(() => ({ type: 'Site settings', label: 'Open Graph image' })),
    ...(attachments > 0 ? [{ type: 'Attachment', label: `${attachments} linked item(s)` }] : []),
  ]
}

async function assertMediaExists(mediaId: string) {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, deletedAt: null },
  })

  if (!media) {
    throw new MutationNotFoundError(`Media "${mediaId}" does not exist.`)
  }

  return media
}

export interface UploadMediaParams {
  file: ValidatedUploadFile
  folderKey: MediaFolderKey
  altText?: string
  uploadedByEmail: string
}

/** Uploads to Cloudinary and persists a `Media` row — the reusable write primitive. */
export async function uploadMediaAsset(params: UploadMediaParams) {
  if (!isCloudinaryConfigured()) {
    throw new MutationValidationError({
      file: ['Cloudinary is not configured. Set CLOUDINARY_* environment variables to enable uploads.'],
    })
  }

  const folder = resolveMediaFolder(params.folderKey)
  const uploadResult = await uploadImageBuffer(params.file.buffer, {
    folder,
    filename: params.file.filename,
  })

  const media = await prisma.media.create({
    data: {
      publicId: uploadResult.public_id,
      url: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      provider: 'CLOUDINARY',
      type: params.file.mediaType,
      folder,
      width: uploadResult.width ?? params.file.width,
      height: uploadResult.height ?? params.file.height,
      format: uploadResult.format ?? null,
      bytes: uploadResult.bytes ?? params.file.buffer.byteLength,
      altText: params.altText?.trim() || null,
      uploadedByEmail: params.uploadedByEmail,
    },
  })

  await recordAuditEvent({ action: 'create', entity: 'Media', entityId: media.id })

  return mapMediaRow(media)
}

export interface ReplaceMediaParams extends UploadMediaParams {
  mediaId: string
}

/**
 * Replaces an asset by uploading a new Cloudinary file and creating a new
 * `Media` row. The previous row is soft-deleted when it has zero references.
 */
export async function replaceMediaAsset(params: ReplaceMediaParams) {
  const existing = await assertMediaExists(params.mediaId)
  const created = await uploadMediaAsset({
    file: params.file,
    folderKey: params.folderKey,
    altText: params.altText ?? existing.altText ?? undefined,
    uploadedByEmail: params.uploadedByEmail,
  })

  const references = await countMediaReferences(existing.id)

  if (references === 0) {
    await prisma.media.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    })
    await recordAuditEvent({ action: 'delete', entity: 'Media', entityId: existing.id })
  }

  return created
}

/** Updates editable metadata on a media row. */
export async function updateMediaMetadata(mediaId: string, altText: string | null) {
  const media = await assertMediaExists(mediaId)

  const updated = await prisma.media.update({
    where: { id: media.id },
    data: { altText },
  })

  await recordAuditEvent({ action: 'update', entity: 'Media', entityId: media.id })
  return mapMediaRow(updated)
}

/** Soft-deletes a media row when it is not referenced anywhere. */
export async function softDeleteMediaAsset(mediaId: string) {
  const media = await assertMediaExists(mediaId)
  const references = await countMediaReferences(mediaId)

  if (references > 0) {
    throw new MutationValidationError({
      id: ['This asset is still in use and cannot be deleted yet. Remove it from all content first.'],
    })
  }

  await prisma.media.update({
    where: { id: media.id },
    data: { deletedAt: new Date() },
  })

  await recordAuditEvent({ action: 'delete', entity: 'Media', entityId: media.id })

  return { id: media.id }
}

/** Returns a media row by id for admin detail views. */
export async function getMediaAssetById(mediaId: string) {
  const media = await prisma.media.findFirst({
    where: { id: mediaId, deletedAt: null },
  })

  return media ? mapMediaRow(media) : null
}

/** Resolves the public URL for a media id, or null when missing/deleted. */
export async function resolveMediaUrlById(mediaId: string | null | undefined): Promise<string | null> {
  if (!mediaId) return null

  const media = await prisma.media.findFirst({
    where: { id: mediaId, deletedAt: null },
    select: { secureUrl: true, url: true },
  })

  if (!media) return null

  return media.secureUrl ?? media.url
}
