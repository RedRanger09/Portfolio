'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { assertUniqueBlogSlug } from '../lib/blog-slug'
import { resolveBlogFeaturedImageWrite } from '../lib/featured-image'
import { updateBlogPostSchema } from '../schemas/blog-post.schema'
import type { BlogPostRow } from './create-blog-post'

export async function updateBlogPost(input: unknown): Promise<MutationResult<BlogPostRow>> {
  await assertAdminAccess()

  return runMutation(updateBlogPostSchema, input, async (data) => {
    const existing = await prisma.blogPost.findUnique({ where: { id: data.id } })
    if (!existing) throw new MutationNotFoundError()

    if (data.slug && data.slug !== existing.slug) {
      await assertUniqueBlogSlug(data.slug, data.id)
    }

    const imageWrite = await resolveBlogFeaturedImageWrite({
      featuredImage: data.featuredImage,
      featuredImageMediaId: data.featuredImageMediaId,
    })

    let publishedAt = existing.publishedAt
    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date()
    } else if (data.status === 'DRAFT') {
      publishedAt = null
    }

    const post = await prisma.blogPost.update({
      where: { id: data.id },
      data: {
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.isVisible !== undefined ? { isVisible: data.isVisible } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(imageWrite.featuredImage !== undefined ? { featuredImage: imageWrite.featuredImage } : {}),
        ...(imageWrite.featuredImageMediaId !== undefined ? { featuredImageMediaId: imageWrite.featuredImageMediaId } : {}),
        ...(data.metaTitle !== undefined ? { metaTitle: data.metaTitle } : {}),
        ...(data.metaDescription !== undefined ? { metaDescription: data.metaDescription } : {}),
        publishedAt,
      },
    })

    await recordAuditEvent({ action: 'update', entity: 'BlogPost', entityId: post.id })
    return post
  }, 'update-blog-post')
}
