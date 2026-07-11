import { prisma } from '@/lib/prisma'
import { mapAccentColor } from '@/lib/prisma-enum-mappers'
import type { JourneyIcon } from '@/features/portfolio/journey/types'
import type { AdminJourneyListItem } from './types'

const JOURNEY_ICON_MAP = {
  GRADUATION_CAP: 'GraduationCap',
  BRAIN: 'Brain',
  WORKFLOW: 'Workflow',
  BUILDING2: 'Building2',
  GLOBE: 'Globe',
  ZAP: 'Zap',
  IMAGE: 'Image',
  TARGET: 'Target',
  SPARKLES: 'Sparkles',
  AWARD: 'Award',
  CODE2: 'Code2',
  TERMINAL_SQUARE: 'TerminalSquare',
} as const satisfies Record<string, JourneyIcon>

const ADMIN_JOURNEY_LIST_SELECT = {
  id: true,
  label: true,
  year: true,
  isCurrent: true,
  isVisible: true,
  order: true,
  updatedAt: true,
} as const

export async function getJourneyMilestonesForAdmin(): Promise<AdminJourneyListItem[]> {
  const rows = await prisma.journeyMilestone.findMany({
    select: { ...ADMIN_JOURNEY_LIST_SELECT, icon: true, accent: true },
    orderBy: { order: 'asc' },
  })

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    year: row.year,
    icon: JOURNEY_ICON_MAP[row.icon],
    accent: mapAccentColor(row.accent),
    isCurrent: row.isCurrent,
    isVisible: row.isVisible ?? true,
    order: row.order,
    updatedAt: row.updatedAt.toISOString(),
  }))
}

export async function getJourneyMilestoneForAdminById(id: string) {
  const row = await prisma.journeyMilestone.findUnique({ where: { id } })
  if (!row) return null

  return {
    id: row.id,
    label: row.label,
    year: row.year,
    description: row.description,
    icon: JOURNEY_ICON_MAP[row.icon],
    accent: mapAccentColor(row.accent),
    isCurrent: row.isCurrent,
    subItems: row.subItems,
    order: row.order,
  }
}
