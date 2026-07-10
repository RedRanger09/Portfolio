import { prisma } from '@/lib/prisma'
import { mapAccentColor } from '@/lib/prisma-enum-mappers'
import { SKILL_CATEGORY_INCLUDE, type SkillCategoryRow } from '@/features/portfolio/skills/data'
import type { SkillGroupIcon } from '@/features/portfolio/skills/types'
import type { AdminSkillCategoryListItem } from './types'

const SKILL_ICON_MAP = { CODE2: 'Code2', BRAIN: 'Brain', LAYOUT: 'Layout', WRENCH: 'Wrench', CLOUD: 'Cloud' } as const satisfies Record<string, SkillGroupIcon>

const SELECT = { id: true, title: true, icon: true, accent: true, order: true, updatedAt: true, _count: { select: { skills: true } } } as const

export async function getSkillCategoriesForAdmin(): Promise<AdminSkillCategoryListItem[]> {
  const rows = await prisma.skillCategory.findMany({ select: SELECT, orderBy: { order: 'asc' } })
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    icon: SKILL_ICON_MAP[row.icon],
    accent: mapAccentColor(row.accent),
    itemCount: row._count.skills,
    order: row.order,
    updatedAt: row.updatedAt.toISOString(),
  }))
}

export async function getSkillCategoryForAdminById(id: string) {
  const row = await prisma.skillCategory.findUnique({ where: { id }, include: SKILL_CATEGORY_INCLUDE })
  if (!row) return null
  return mapSkillCategoryRow(row)
}

function mapSkillCategoryRow(row: SkillCategoryRow) {
  return {
    id: row.id,
    title: row.title,
    icon: SKILL_ICON_MAP[row.icon],
    accent: mapAccentColor(row.accent),
    note: row.note,
    items: row.skills.map((s) => s.technology.name),
    order: row.order,
  }
}
