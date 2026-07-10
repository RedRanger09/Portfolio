'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { MEDIA_ATTACHABLE_TYPE } from '@/features/media/lib/media-attachment-constants'
import { reorderMediaGalleryItems } from '@/features/media/lib/media-attachments'
import type { MediaGalleryItem } from '@/features/media/types'
import { reorderProjectGallerySchema } from '../schemas/project-gallery.schema'
import { syncProjectGalleryJson } from '../lib/project-gallery'

export async function reorderProjectGallery(input: unknown): Promise<MutationResult<MediaGalleryItem[]>> {
  await assertAdminAccess()

  return runMutation(reorderProjectGallerySchema, input, async (data) => {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true },
    })

    if (!project) {
      throw new MutationNotFoundError(`Project "${data.projectId}" does not exist.`)
    }

    await reorderMediaGalleryItems({
      attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
      attachableId: data.projectId,
      attachmentIds: data.attachmentIds,
    })

    const items = await syncProjectGalleryJson(data.projectId)
    await recordAuditEvent({ action: 'update', entity: 'Project', entityId: data.projectId })
    return items
  }, 'reorder-project-gallery')
}
