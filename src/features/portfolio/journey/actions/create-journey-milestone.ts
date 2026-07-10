'use server'

import type { JourneyMilestone } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { mapAccentColorToDb } from '@/lib/prisma-enum-mappers'
import { JOURNEY_ICON_TO_DB } from '../data'
import { createJourneyMilestoneSchema } from '../schemas/journey-milestone.schema'

/** Creates a new `JourneyMilestone`. Single-table write — no transaction needed. */
export async function createJourneyMilestone(input: unknown): Promise<MutationResult<JourneyMilestone>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    createJourneyMilestoneSchema,
    input,
    async (data) => {
      const order = data.order ?? (await prisma.journeyMilestone.count())

      const milestone = await prisma.journeyMilestone.create({
        data: {
          label: data.label,
          year: data.year,
          description: data.description,
          icon: JOURNEY_ICON_TO_DB[data.icon],
          accent: mapAccentColorToDb(data.accent),
          isCurrent: data.isCurrent,
          subItems: data.subItems,
          order,
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'create', entity: 'JourneyMilestone', entityId: milestone.id })

      return milestone
    },
    'create-journey-milestone',
  )
}
