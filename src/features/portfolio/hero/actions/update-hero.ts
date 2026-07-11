'use server'

import type { Hero } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { toJson } from '@/lib/prisma-json'
import { updateHeroSchema } from '../schemas/hero.schema'

/**
 * Replaces the singleton `Hero` row's content. `Hero` has no natural
 * unique key to `upsert` on (`prisma/schema.prisma`'s "exactly one row"
 * note), so this looks up whatever row currently exists and updates it,
 * or creates the first one if none exists yet (e.g. before the database
 * has ever been seeded) — there is intentionally no separate
 * `createHero`/`deleteHero`.
 */
export async function updateHero(input: unknown): Promise<MutationResult<Hero>> {
  await assertAdminAccess()

  return runMutation(
    updateHeroSchema,
    input,
    async (data) => {
      const existing = await prisma.hero.findFirst({ select: { id: true } })

      const heroData = {
        eyebrow: data.eyebrow,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        profileImage: data.profileImage,
        interestCards: toJson(data.interestCards),
        ctas: toJson(data.ctas),
        showInterestCards: data.showInterestCards,
      }

      const hero = existing
        ? await prisma.hero.update({ where: { id: existing.id }, data: heroData })
        : await prisma.hero.create({ data: heroData })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: existing ? 'update' : 'create', entity: 'Hero', entityId: hero.id })

      return hero
    },
    'update-hero',
  )
}
