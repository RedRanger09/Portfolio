import { prisma } from '@/lib/prisma'
import { MutationValidationError } from '@/lib/mutation-result'

export async function assertUniqueBlogSlug(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (existing && existing.id !== excludeId) {
    throw new MutationValidationError({ slug: ['This slug is already in use.'] })
  }
}
