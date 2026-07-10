'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteBlogPostSchema } from '../schemas/blog-post.schema'

export async function deleteBlogPost(input: unknown): Promise<MutationResult<{ id: string }>> {
  await assertAdminAccess()

  return runMutation(deleteBlogPostSchema, input, async ({ id }) => {
    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new MutationNotFoundError()

    await prisma.blogPost.delete({ where: { id } })
    await recordAuditEvent({ action: 'delete', entity: 'BlogPost', entityId: id })
    return { id }
  }, 'delete-blog-post')
}
