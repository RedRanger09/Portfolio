'use server'

import { assertAdminAccess, requireAuthenticatedSession } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, mutationSuccess, type MutationResult } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { attachMediaToEntity } from '@/features/media/lib/media-attachments'
import type { MediaGalleryItem } from '@/features/media/types'
import { MEDIA_ATTACHABLE_TYPE } from '@/features/media/lib/media-attachment-constants'
import { readUploadFile, validateImageUpload } from '@/features/media/lib/media-validation'
import { uploadMediaAsset } from '@/features/media/lib/media-service'
import { handleMediaActionError } from '@/features/media/actions/media-action-errors'
import { parseFormMetadata } from '@/features/media/actions/parse-form-metadata'
import { addProjectGalleryImageMetadataSchema } from '../schemas/project-gallery.schema'
import { syncProjectGalleryJson } from '../lib/project-gallery'

/** Uploads via Cloudinary and attaches the asset to the project gallery. */
export async function addProjectGalleryImage(formData: FormData): Promise<MutationResult<MediaGalleryItem[]>> {
  await assertAdminAccess()

  try {
    const metadata = parseFormMetadata(addProjectGalleryImageMetadataSchema, formData, {
      projectId: 'projectId',
      caption: 'caption',
      altText: 'altText',
    })

    const project = await prisma.project.findUnique({
      where: { id: metadata.projectId },
      select: { id: true },
    })

    if (!project) {
      throw new MutationNotFoundError(`Project "${metadata.projectId}" does not exist.`)
    }

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

    await attachMediaToEntity({
      mediaId: media.id,
      attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
      attachableId: project.id,
      caption: metadata.caption,
    })

    const items = await syncProjectGalleryJson(project.id)
    await recordAuditEvent({ action: 'update', entity: 'Project', entityId: project.id })

    return mutationSuccess(items)
  } catch (error) {
    return handleMediaActionError(error, 'add-project-gallery-image')
  }
}
