import { prisma } from '@/lib/prisma'
import { MutationValidationError } from '@/lib/mutation-result'

/** Ensures a project slug is unique before create/update writes. */
export async function assertUniqueProjectSlug(slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (existing && existing.id !== excludeId) {
    throw new MutationValidationError({ slug: ['This slug is already in use.'] })
  }
}

/** Generates a URL-safe slug from a project title. */
export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** Picks the next available duplicate slug (`base`, `base-2`, `base-3`, …). */
export async function generateDuplicateSlug(baseSlug: string): Promise<string> {
  let candidate = `${baseSlug}-copy`
  let suffix = 2

  while (await prisma.project.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseSlug}-copy-${suffix}`
    suffix += 1
  }

  return candidate
}
