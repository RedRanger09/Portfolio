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

/**
 * Resolves each name in `names` to its `Technology.id`, in the same
 * order, upserting a new row for any name that doesn't already exist.
 * Must be called with the transaction client of whichever mutation is
 * writing the `Project`/`SkillCategory` that references these names, so a
 * failed write can never leave an orphaned `Technology` row behind.
 */
export async function resolveTechnologyIds(tx: Prisma.TransactionClient, names: string[]): Promise<string[]> {
  const ids: string[] = []
  for (const name of names) {
    const technology = await tx.technology.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: slugifyTechnologyName(name),
        logoSlug: getTechLogoSlug(name),
      },
    })
    ids.push(technology.id)
  }
  return ids
}
