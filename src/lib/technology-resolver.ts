/**
 * Shared write-side helper for the one entity two different features
 * reference by name: `Technology` (`domain-model.md §4.1`). Both
 * `projects/actions/` (`Project.techStack`) and `skills/actions/`
 * (`SkillCategory.items`) need "given these names, get me `Technology`
 * ids, creating any that don't exist yet" — the mutation-side counterpart
 * to `prisma/seed.ts`'s own technology-dedup pass. Centralized here so
 * that logic exists exactly once instead of once per feature.
 */

import type { Prisma } from '@prisma/client'
import { getTechLogoSlug } from '@/constants/tech-logos'

export function slugifyTechnologyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureUniqueTechnologySlug(
  tx: Prisma.TransactionClient,
  baseSlug: string,
  excludeName?: string,
): Promise<string> {
  let candidate = baseSlug || 'technology'
  let suffix = 2

  while (true) {
    const existing = await tx.technology.findUnique({
      where: { slug: candidate },
      select: { name: true },
    })

    if (!existing || (excludeName && existing.name === excludeName)) {
      return candidate
    }

    candidate = `${baseSlug || 'technology'}-${suffix}`
    suffix += 1
  }
}

/**
 * Resolves each name in `names` to its `Technology.id`, in the same
 * order, creating any name that doesn't already exist (case-insensitive
 * match reuses an existing row). Must be called with the transaction
 * client of whichever mutation is writing the `Project`/`SkillCategory`.
 */
export async function resolveTechnologyIds(tx: Prisma.TransactionClient, names: string[]): Promise<string[]> {
  const ids: string[] = []

  for (const rawName of names) {
    const name = rawName.trim()
    if (!name) continue

    const existing = await tx.technology.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    })

    if (existing) {
      ids.push(existing.id)
      continue
    }

    const baseSlug = slugifyTechnologyName(name)
    const slug = await ensureUniqueTechnologySlug(tx, baseSlug)

    const technology = await tx.technology.create({
      data: {
        name,
        slug,
        logoSlug: getTechLogoSlug(name),
      },
    })

    ids.push(technology.id)
  }

  return ids
}
