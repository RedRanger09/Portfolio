import { SITE } from '@/config/site.config'
import { prisma } from '@/lib/prisma'
import type { ResumeData } from './types'

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the `Resume`
 * table from. Served only if the database is unreachable or unseeded.
 */
export const FALLBACK_RESUME_DATA: ResumeData = {
  label: 'Resume',
  title: 'My Resume',
  filePath: SITE.resumePath,
  previewImage: SITE.resumePreview,
  previewAlt: `Resume preview — ${SITE.name}`,
  previewImageWidth: 763,
  previewImageHeight: 986,
  isVisible: true,
}

/**
 * Returns Resume section content when visible.
 * Hidden resumes (`isVisible: false`) return `null` so the section omits itself.
 */
export async function getResumeData(): Promise<ResumeData | null> {
  try {
    const row = await prisma.resume.findFirst()
    if (!row) return FALLBACK_RESUME_DATA
    if (!row.isVisible) return null

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
  } catch (error) {
    console.error('[db:resume] Query failed — serving static fallback content.', error)
    return FALLBACK_RESUME_DATA
  }
}
