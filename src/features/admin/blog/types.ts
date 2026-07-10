import type { BlogPostStatus } from '@prisma/client'

export type BlogFilterKey = 'all' | 'published' | 'draft'
export type BlogSortKey = 'updatedAt' | 'title' | 'publishedAt'

export interface AdminBlogListItem {
  id: string
  slug: string
  title: string
  status: BlogPostStatus
  published: boolean
  tags: string[]
  featuredImage: string
  publishedAt: string | null
  updatedAt: string
}

export interface BlogEditorValues {
  slug: string
  title: string
  excerpt: string
  content: string
  status: BlogPostStatus
  tags: string[]
  featuredImage: string
  featuredImageMediaId: string | null
  metaTitle: string
  metaDescription: string
}

export const EMPTY_BLOG_EDITOR_VALUES: BlogEditorValues = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  status: 'DRAFT',
  tags: [],
  featuredImage: '',
  featuredImageMediaId: null,
  metaTitle: '',
  metaDescription: '',
}

export function mapBlogRowToEditorValues(row: {
  slug: string
  title: string
  excerpt: string
  content: string
  status: BlogPostStatus
  tags: string[]
  featuredImage: string
  featuredImageMediaId: string | null
  metaTitle: string | null
  metaDescription: string | null
}): BlogEditorValues {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    tags: row.tags,
    featuredImage: row.featuredImage,
    featuredImageMediaId: row.featuredImageMediaId,
    metaTitle: row.metaTitle ?? '',
    metaDescription: row.metaDescription ?? '',
  }
}

export function mapEditorValuesToCreateInput(values: BlogEditorValues) {
  return {
    slug: values.slug,
    title: values.title,
    excerpt: values.excerpt,
    content: values.content,
    status: values.status,
    tags: values.tags,
    featuredImage: values.featuredImage,
    featuredImageMediaId: values.featuredImageMediaId,
    metaTitle: values.metaTitle || undefined,
    metaDescription: values.metaDescription || undefined,
  }
}

export function mapEditorValuesToUpdateInput(id: string, values: BlogEditorValues) {
  return {
    id,
    ...mapEditorValuesToCreateInput(values),
    metaTitle: values.metaTitle || null,
    metaDescription: values.metaDescription || null,
  }
}
