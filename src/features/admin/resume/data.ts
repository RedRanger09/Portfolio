import { prisma } from '@/lib/prisma'

export async function getResumeForAdmin() {
  const row = await prisma.resume.findFirst()
  if (!row) return null
  return {
    label: row.label,
    title: row.title,
    filePath: row.filePath,
    previewImage: row.previewImage,
    previewAlt: row.previewAlt,
    previewImageWidth: row.previewImageWidth,
    previewImageHeight: row.previewImageHeight,
  }
}
