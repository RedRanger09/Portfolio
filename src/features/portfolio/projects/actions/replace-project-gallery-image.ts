'use server'

import { assertAdminAccess, requireAuthenticatedSession } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, mutationSuccess, type MutationResult } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { MEDIA_ATTACHABLE_TYPE, MEDIA_ATTACHMENT_ROLE } from '@/features/media/lib/media-attachment-constants'
import type { MediaGalleryItem } from '@/features/media/types'
import { readUploadFile, validateImageUpload } from '@/features/media/lib/media-validation'
import { uploadMediaAsset } from '@/features/media/lib/media-service'
import { handleMediaActionError } from '@/features/media/actions/media-action-errors'
import { parseFormMetadata } from '@/features/media/actions/parse-form-metadata'
import { replaceProjectGalleryImageMetadataSchema } from '../schemas/project-gallery.schema'
import { syncProjectGalleryJson } from '../lib/project-gallery'

/** Replaces the image for an existing gallery attachment using the shared upload pipeline. */
export async function replaceProjectGalleryImage(formData: FormData): Promise<MutationResult<MediaGalleryItem[]>> {
  await assertAdminAccess()

  try {
    const metadata = parseFormMetadata(replaceProjectGalleryImageMetadataSchema, formData, {
      projectId: 'projectId',
      attachmentId: 'attachmentId',
      caption: 'caption',
      altText: 'altText',
    })

    const attachment = await prisma.mediaAttachment.findFirst({
      where: {
        id: metadata.attachmentId,
        attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
        attachableId: metadata.projectId,
        role: MEDIA_ATTACHMENT_ROLE.GALLERY,
      },
    })

    if (!attachment) {
      throw new MutationNotFoundError(`Gallery item "${metadata.attachmentId}" does not exist.`)
    }

    const previousMediaId = attachment.mediaId
    const file = readUploadFile(formData)
    const buffer = Buffer.from(await file.arrayBuffer())
    const validated = validateImageUpload(file, buffer)
    const session = await requireAuthenticatedSession()

    const media = await uploadMediaAsset({
      file: validated,
      folderKey: 'projects',
      altText: metadata.altText,
      uploadedByEmail: session.email,
    })

    await prisma.mediaAttachment.update({
      where: { id: attachment.id },
      data: {
        mediaId: media.id,
        ...(metadata.caption !== undefined ? { caption: metadata.caption.trim() || null } : {}),
      },
    })

    const [projectCount, attachmentCount, blogCount, settingsCount] = await Promise.all([
      prisma.project.count({ where: { screenshotMediaId: previousMediaId } }),
      prisma.mediaAttachment.count({ where: { mediaId: previousMediaId } }),
      prisma.blogPost.count({ where: { featuredImageMediaId: previousMediaId } }),
      prisma.siteSettings.count({ where: { ogImageMediaId: previousMediaId } }),
    ])

    if (projectCount + attachmentCount + blogCount + settingsCount === 0) {
      await prisma.media.update({
        where: { id: previousMediaId },
        data: { deletedAt: new Date() },
      })
    }

    const items = await syncProjectGalleryJson(metadata.projectId)
    await recordAuditEvent({ action: 'update', entity: 'Project', entityId: metadata.projectId })

    return mutationSuccess(items)
  } catch (error) {
    return handleMediaActionError(error, 'replace-project-gallery-image')
  }
}
