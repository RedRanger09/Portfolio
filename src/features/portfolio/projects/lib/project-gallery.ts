import 'server-only'

import { prisma } from '@/lib/prisma'
import { toJson } from '@/lib/prisma-json'
import {
  galleryItemsToJsonSnapshot,
  listProjectGalleryItems,
} from '@/features/media/lib/media-attachments'
import type { MediaGalleryItem } from '@/features/media/types'

/** Rewrites denormalized `Project.gallery` JSON from MediaAttachment rows. */
export async function syncProjectGalleryJson(projectId: string): Promise<MediaGalleryItem[]> {
  const items = await listProjectGalleryItems(projectId)

  await prisma.project.update({
    where: { id: projectId },
    data: { gallery: toJson(galleryItemsToJsonSnapshot(items)) },
  })

  return items
}
