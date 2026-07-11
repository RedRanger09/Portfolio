import { z } from 'zod'
import { slugifyText } from '@/lib/slug'

const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .max(120, 'Slug must be at most 120 characters.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric, and hyphen-separated.')

const imagePathSchema = z.string().min(1, 'Featured image is required.').max(500)

export const blogPostStatusSchema = z.enum(['DRAFT', 'PUBLISHED'])

export const createBlogPostSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Title is required.').max(160),
  excerpt: z.string().min(1, 'Excerpt is required.').max(500),
  content: z.string().min(1, 'Content is required.').max(100_000),
  status: blogPostStatusSchema.default('DRAFT'),
  tags: z.array(z.string().min(1).max(40)).default([]),
  featuredImage: imagePathSchema,
  featuredImageMediaId: z.string().min(1).nullable().optional(),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
})

export const updateBlogPostSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema.optional(),
  title: z.string().min(1).max(160).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(100_000).optional(),
  status: blogPostStatusSchema.optional(),
  isVisible: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(40)).optional(),
  featuredImage: imagePathSchema.optional(),
  featuredImageMediaId: z.string().min(1).nullable().optional(),
  metaTitle: z.string().max(160).nullable().optional(),
  metaDescription: z.string().max(320).nullable().optional(),
})

export const deleteBlogPostSchema = z.object({
  id: z.string().min(1),
})

export function slugifyBlogTitle(title: string): string {
  return slugifyText(title)
}
