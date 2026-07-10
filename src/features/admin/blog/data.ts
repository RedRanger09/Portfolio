import { prisma } from '@/lib/prisma'
import type { AdminBlogListItem } from './types'

const BLOG_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  status: true,
  tags: true,
  featuredImage: true,
  publishedAt: true,
  updatedAt: true,
} as const

function mapListItem(row: {
  id: string
  slug: string
  title: string
  status: 'DRAFT' | 'PUBLISHED'
  tags: string[]
  featuredImage: string
  publishedAt: Date | null
  updatedAt: Date
}): AdminBlogListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    published: row.status === 'PUBLISHED',
    tags: row.tags,
    featuredImage: row.featuredImage,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function getBlogPostsForAdmin(): Promise<AdminBlogListItem[]> {
  const rows = await prisma.blogPost.findMany({
    select: BLOG_LIST_SELECT,
    orderBy: { updatedAt: 'desc' },
  })

  return rows.map(mapListItem)
}

export async function getBlogPostForAdminById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } })
}
