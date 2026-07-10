import { prisma } from '@/lib/prisma'
import { mapMediaRow } from './lib/resolve-media-url'
import { getMediaUsageReferences } from './lib/media-service'
import type { MediaAsset, MediaFolderKey } from './types'
import { getMediaEnvironmentPrefix, listMediaFolderKeys, parseMediaFolderKey } from './lib/media-folders'

export interface MediaUsageReference {
  type: string
  label: string
}

export interface AdminMediaListItem extends MediaAsset {
  folderKey: MediaFolderKey | null
  referenceCount: number
  usage: MediaUsageReference[]
}

const ADMIN_MEDIA_SELECT = {
  id: true,
  publicId: true,
  url: true,
  secureUrl: true,
  provider: true,
  type: true,
  folder: true,
  width: true,
  height: true,
  format: true,
  bytes: true,
  altText: true,
  uploadedByEmail: true,
  createdAt: true,
  updatedAt: true,
} as const

/** Admin media library list — lean select, reference counts computed per row. */
export async function getMediaForAdmin(folderKey?: MediaFolderKey): Promise<AdminMediaListItem[]> {
  const folderPrefix = folderKey ? `${getMediaEnvironmentPrefix()}/${folderKey}` : undefined

  const rows = await prisma.media.findMany({
    where: {
      deletedAt: null,
      ...(folderPrefix ? { folder: folderPrefix } : {}),
    },
    select: ADMIN_MEDIA_SELECT,
    orderBy: { createdAt: 'desc' },
  })

  return Promise.all(
    rows.map(async (row) => {
      const asset = mapMediaRow(row)
      const usage = await getMediaUsageReferences(asset.id)
      return {
        ...asset,
        folderKey: parseMediaFolderKey(asset.folder),
        referenceCount: usage.length,
        usage,
      }
    }),
  )
}

export function getMediaFolderOptions() {
  return listMediaFolderKeys().map((key) => ({ value: key, label: key }))
}

export { isCloudinaryConfigured } from '@/lib/cloudinary'
