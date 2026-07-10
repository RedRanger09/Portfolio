'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { MEDIA_ATTACHABLE_TYPE, MEDIA_ATTACHMENT_ROLE } from '@/features/media/lib/media-attachment-constants'
import { updateMediaGalleryItem } from '@/features/media/lib/media-attachments'
import type { MediaGalleryItem } from '@/features/media/types'
import { updateProjectGalleryItemSchema } from '../schemas/project-gallery.schema'
import { syncProjectGalleryJson } from '../lib/project-gallery'

export async function updateProjectGalleryItem(input: unknown): Promise<MutationResult<MediaGalleryItem[]>> {
  await assertAdminAccess()

  return runMutation(updateProjectGalleryItemSchema, input, async (data) => {
    const attachment = await prisma.mediaAttachment.findFirst({
      where: {
        id: data.attachmentId,
        attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
        attachableId: data.projectId,
        role: MEDIA_ATTACHMENT_ROLE.GALLERY,
      },
      select: { id: true },
    })

    if (!attachment) {
      throw new MutationNotFoundError(`Gallery item "${data.attachmentId}" does not exist.`)
    }

    await updateMediaGalleryItem({
      attachmentId: data.attachmentId,
      caption: data.caption,
      altText: data.altText,
    })

    const items = await syncProjectGalleryJson(data.projectId)
    await recordAuditEvent({ action: 'update', entity: 'Project', entityId: data.projectId })
    return items
  }, 'update-project-gallery-item')
}
