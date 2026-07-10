import type { EducationType as PrismaEducationType } from '@prisma/client'
import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { EducationEntry, EducationSectionContent, EducationType } from './types'

const educationSectionContent: EducationSectionContent = {
  label: 'Education',
  title: 'Academic background',
}

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the `Education`
 * table from. Served directly today; once migrated, served only if the
 * database is unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_EDUCATION: EducationEntry[] = [
  {
    id: 'school',
    type: 'school',
    institution: 'La Martiniere College',
    degree: 'High School',
    period: '2010 – 2024',
    location: 'Lucknow, India',
    description: 'Completed schooling with a focus on science and mathematics. Built early interest in computers and problem-solving.',
    highlights: ['Science stream', 'Mathematics', 'Computer fundamentals'],
  },
  {
    id: 'college',
    type: 'college',
    institution: 'Shri Ramswaroop Memorial College of Engineering and Management',
    shortName: 'SRMCEM',
    degree: 'B.Tech Computer Science',
    period: '2024 – Present',
    location: 'Lucknow, India',
    description: 'Currently pursuing B.Tech in Computer Science. Applying coursework through AI/ML projects alongside studies.',
    highlights: ['Data Structures & Algorithms', 'ML coursework', 'Project portfolio', 'Open source contributions'],
    expectedGraduation: '2028',
    currentSemester: '2nd Year',
  },
]

/**
 * Mirrors `EducationType` in `prisma/schema.prisma` — only this feature
 * reads/writes it, so both directions stay local here.
 * `education/actions/` imports `EDUCATION_TYPE_TO_DB` for writes.
 */
const EDUCATION_TYPE_MAP: Record<PrismaEducationType, EducationType> = {
  SCHOOL: 'school',
  COLLEGE: 'college',
}

export const EDUCATION_TYPE_TO_DB: Record<EducationType, PrismaEducationType> = {
  school: 'SCHOOL',
  college: 'COLLEGE',
}

/**
 * Returns every education entry, in display order. Reads from the
 * database, falling back to `FALLBACK_EDUCATION` if the database is
 * unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export async function getEducation(): Promise<EducationEntry[]> {
  return withDbFallback(
    async () => {
      const rows = await prisma.education.findMany({ orderBy: { order: 'asc' } })
      return rows.map((row) => ({
        id: row.id,
        type: EDUCATION_TYPE_MAP[row.type],
        institution: row.institution,
        shortName: row.shortName ?? undefined,
        degree: row.degree,
        period: row.period,
        location: row.location,
        description: row.description,
        highlights: row.highlights,
        expectedGraduation: row.expectedGraduation ?? undefined,
        currentSemester: row.currentSemester ?? undefined,
      }))
    },
    FALLBACK_EDUCATION,
    'education',
  )
}

export async function getEducationSectionContent(): Promise<EducationSectionContent> {
  return educationSectionContent
}
