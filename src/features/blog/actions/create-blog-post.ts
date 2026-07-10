'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { assertUniqueBlogSlug } from '../lib/blog-slug'
import { resolveBlogFeaturedImageWrite } from '../lib/featured-image'
import { createBlogPostSchema } from '../schemas/blog-post.schema'

export type BlogPostRow = Awaited<ReturnType<typeof prisma.blogPost.create>>

export async function createBlogPost(input: unknown): Promise<MutationResult<BlogPostRow>> {
  await assertAdminAccess()

  return runMutation(createBlogPostSchema, input, async (data) => {
    await assertUniqueBlogSlug(data.slug)

    const imageWrite = await resolveBlogFeaturedImageWrite({
      featuredImage: data.featuredImage,
      featuredImageMediaId: data.featuredImageMediaId ?? null,
    })

    const publishedAt = data.status === 'PUBLISHED' ? new Date() : null

    const post = await prisma.blogPost.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        status: data.status,
        tags: data.tags,
        featuredImage: imageWrite.featuredImage!,
        featuredImageMediaId: imageWrite.featuredImageMediaId ?? null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        publishedAt,
      },
    })

    await recordAuditEvent({ action: 'create', entity: 'BlogPost', entityId: post.id })
    return post
  }, 'create-blog-post')
}
