import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { resolveMediaUrl } from '@/features/media/lib/resolve-media-url'
import { estimateReadingTimeMinutes, getBlogCategory } from './lib/reading-time'
import type { BlogAdjacentPosts, BlogPostDetail, BlogPostSummary } from './types'

export { collectBlogCategories } from './lib/categories'

const PUBLISHED_WHERE: Prisma.BlogPostWhereInput = {
  status: 'PUBLISHED',
  publishedAt: { not: null },
  isVisible: true,
}

const SUMMARY_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  tags: true,
  content: true,
  featuredImage: true,
  publishedAt: true,
  featuredImageMedia: {
    select: {
      id: true,
      url: true,
      secureUrl: true,
      altText: true,
    },
  },
} satisfies Prisma.BlogPostSelect

type SummaryRow = Prisma.BlogPostGetPayload<{ select: typeof SUMMARY_SELECT }>

function mapSummary(row: SummaryRow): BlogPostSummary {
  const image = resolveMediaUrl(row.featuredImageMedia, row.featuredImage)
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    tags: row.tags,
    category: getBlogCategory(row.tags),
    featuredImage: image,
    featuredImageAlt: row.featuredImageMedia?.altText || row.title,
    publishedAt: row.publishedAt!.toISOString(),
    readingTimeMinutes: estimateReadingTimeMinutes(row.content),
  }
}

/**
 * Empty published lists are valid (unlike seeded portfolio sections), so
 * these loaders return `[]` / `undefined` on miss without treating emptiness
 * as a database failure.
 */
async function safeBlogQuery<T>(label: string, queryFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error(`[db:${label}] Query failed — serving empty blog fallback.`, error)
    return fallback
  }
}

/** All published posts, newest first. Client search/filter runs over this list. */
export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  return safeBlogQuery(
    'blog-posts',
    async () => {
      const rows = await prisma.blogPost.findMany({
        where: PUBLISHED_WHERE,
        select: SUMMARY_SELECT,
        orderBy: { publishedAt: 'desc' },
      })
      return rows.map(mapSummary)
    },
    [],
  )
}

export async function getLatestPublishedBlogPosts(limit = 3): Promise<BlogPostSummary[]> {
  return safeBlogQuery(
    `blog-latest:${limit}`,
    async () => {
      const rows = await prisma.blogPost.findMany({
        where: PUBLISHED_WHERE,
        select: SUMMARY_SELECT,
        orderBy: { publishedAt: 'desc' },
        take: limit,
      })
      return rows.map(mapSummary)
    },
    [],
  )
}

export async function getAllPublishedBlogSlugs(): Promise<string[]> {
  return safeBlogQuery(
    'blog-slugs',
    async () => {
      const rows = await prisma.blogPost.findMany({
        where: PUBLISHED_WHERE,
        select: { slug: true },
        orderBy: { publishedAt: 'desc' },
      })
      return rows.map((row) => row.slug)
    },
    [],
  )
}

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPostDetail | undefined> => {
  return safeBlogQuery(
    `blog:${slug}`,
    async () => {
      const row = await prisma.blogPost.findFirst({
        where: { ...PUBLISHED_WHERE, slug },
        select: {
          ...SUMMARY_SELECT,
          metaTitle: true,
          metaDescription: true,
          updatedAt: true,
        },
      })
      if (!row) return undefined

      return {
        ...mapSummary(row),
        content: row.content,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        updatedAt: row.updatedAt.toISOString(),
      }
    },
    undefined,
  )
})

/**
 * Previous = older, Next = newer. Index into one ordered list — no N+1.
 */
export async function getAdjacentBlogPosts(slug: string, allPosts?: BlogPostSummary[]): Promise<BlogAdjacentPosts> {
  const posts = allPosts ?? (await getPublishedBlogPosts())
  const index = posts.findIndex((post) => post.slug === slug)
  if (index < 0) return { previous: null, next: null }

  return {
    previous: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  }
}

/**
 * Related posts: same category (first tag) preferred, then newest fillers.
 */
export async function getRelatedBlogPosts(
  slug: string,
  category: string | null,
  limit = 3,
  allPosts?: BlogPostSummary[],
): Promise<BlogPostSummary[]> {
  const posts = allPosts ?? (await getPublishedBlogPosts())
  const others = posts.filter((post) => post.slug !== slug)

  const sameCategory = category ? others.filter((post) => post.category === category) : []
  const remainder = others.filter((post) => !sameCategory.includes(post))

  return [...sameCategory, ...remainder].slice(0, limit)
}
