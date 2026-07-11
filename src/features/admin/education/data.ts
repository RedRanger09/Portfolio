import { prisma } from '@/lib/prisma'
import type { EducationType } from '@/features/portfolio/education/types'
import type { AdminEducationListItem } from './types'

const TYPE_MAP = { SCHOOL: 'school', COLLEGE: 'college' } as const satisfies Record<string, EducationType>

const SELECT = { id: true, institution: true, type: true, period: true, degree: true, isVisible: true, order: true, updatedAt: true } as const

export async function getEducationForAdmin(): Promise<AdminEducationListItem[]> {
  const rows = await prisma.education.findMany({ select: SELECT, orderBy: { order: 'asc' } })
  return rows.map((row) => ({
    id: row.id,
    institution: row.institution,
    type: TYPE_MAP[row.type],
    period: row.period,
    degree: row.degree,
    isVisible: row.isVisible ?? true,
    order: row.order,
    updatedAt: row.updatedAt.toISOString(),
  }))
}

export async function getEducationForAdminById(id: string) {
  const row = await prisma.education.findUnique({ where: { id } })
  if (!row) return null
  return {
    id: row.id,
    type: TYPE_MAP[row.type],
    institution: row.institution,
    shortName: row.shortName ?? '',
    degree: row.degree,
    period: row.period,
    location: row.location,
    description: row.description,
    highlights: row.highlights,
    expectedGraduation: row.expectedGraduation ?? '',
    currentSemester: row.currentSemester ?? '',
    order: row.order,
  }
}
