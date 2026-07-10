'use server'

import type { About } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { updateAboutSchema } from '../schemas/about.schema'

/** Replaces the singleton `About` row's content — see `update-hero.ts` for why this is an upsert-by-lookup, not a true `upsert`. */
export async function updateAbout(input: unknown): Promise<MutationResult<About>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    updateAboutSchema,
    input,
    async (data) => {
      const existing = await prisma.about.findFirst({ select: { id: true } })

      const aboutData = {
        label: data.label,
        title: data.title,
        subtitle: data.subtitle,
        story: data.story,
        currentlyLearningTitle: data.currentlyLearning.title,
        currentlyLearningItems: data.currentlyLearning.items,
        interestsLabel: data.interestsLabel,
        interests: data.interests,
      }

      const about = existing
        ? await prisma.about.update({ where: { id: existing.id }, data: aboutData })
        : await prisma.about.create({ data: aboutData })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: existing ? 'update' : 'create', entity: 'About', entityId: about.id })

      return about
    },
    'update-about',
  )
}
