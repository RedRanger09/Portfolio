import { prisma } from '@/lib/prisma'
import { PROJECT_INCLUDE, type ProjectRow } from '@/features/portfolio/projects/data'
import { listProjectGalleryItems } from '@/features/media/lib/media-attachments'
import type { AdminProjectListItem } from './types'

const ADMIN_PROJECT_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  category: true,
  featured: true,
  isPlaceholder: true,
  isVisible: true,
  order: true,
  updatedAt: true,
  screenshot: true,
} as const

function mapAdminListItem(row: {
  id: string
  slug: string
  name: string
  category: string
  featured: boolean
  isPlaceholder: boolean
  isVisible: boolean
  order: number
  updatedAt: Date
  screenshot: string
}): AdminProjectListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    featured: row.featured,
    isPlaceholder: row.isPlaceholder,
    published: !row.isPlaceholder,
    isVisible: row.isVisible,
    order: row.order,
    updatedAt: row.updatedAt.toISOString(),
    screenshot: row.screenshot,
  }
}

/** Admin list query — selects only fields the table needs, no N+1 joins. */
export async function getProjectsForAdmin(): Promise<AdminProjectListItem[]> {
  const rows = await prisma.project.findMany({
    select: ADMIN_PROJECT_LIST_SELECT,
    orderBy: { order: 'asc' },
  })

  return rows.map(mapAdminListItem)
}

/** Full project row for the editor — reuses the portfolio feature's include shape. */
export async function getProjectForAdminById(id: string): Promise<ProjectRow | null> {
  return prisma.project.findUnique({
    where: { id },
    include: PROJECT_INCLUDE,
  })
}

/** Ordered gallery attachments for the project editor. */
export async function getProjectGalleryForAdmin(projectId: string) {
  return listProjectGalleryItems(projectId)
}

/** Technology names for the editor's multi-select suggestions. */
export { getTechnologyNamesForAdmin } from '@/features/admin/shared/technology-suggestions'
