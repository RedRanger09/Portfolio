import { prisma } from '@/lib/prisma'
import type { ResumeData } from '@/features/portfolio/resume/types'

export async function getResumeForAdmin(): Promise<ResumeData | null> {
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
    isVisible: row.isVisible,
  }
}
