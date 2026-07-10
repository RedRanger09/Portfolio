import { SITE } from '@/config/site.config'
import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { ResumeData } from './types'

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the `Resume`
 * table from. Served directly today; once migrated, served only if the
 * database is unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_RESUME_DATA: ResumeData = {
  label: 'Resume',
  title: 'My Resume',
  filePath: SITE.resumePath,
  previewImage: SITE.resumePreview,
  previewAlt: `Resume preview — ${SITE.name}`,
  // Intrinsic dimensions of `public/resume/resume-preview.png` — next/image
  // requires explicit width/height (or `fill`) to avoid layout shift.
  previewImageWidth: 763,
  previewImageHeight: 986,
}

/**
 * Returns Resume section content. Reads the singleton `Resume` row from
 * the database, falling back to `FALLBACK_RESUME_DATA` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getResumeData(): Promise<ResumeData> {
  return withDbFallback(
    async () => {
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
    },
    FALLBACK_RESUME_DATA,
    'resume',
  )
}
