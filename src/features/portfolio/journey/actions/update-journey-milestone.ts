'use server'

import type { JourneyMilestone } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { mapAccentColorToDb } from '@/lib/prisma-enum-mappers'
import { JOURNEY_ICON_TO_DB } from '../data'
import { updateJourneyMilestoneSchema } from '../schemas/journey-milestone.schema'

/** Partially updates an existing `JourneyMilestone`. Single-table write — no transaction needed. */
export async function updateJourneyMilestone(input: unknown): Promise<MutationResult<JourneyMilestone>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    updateJourneyMilestoneSchema,
    input,
    async (data) => {
      const { id, icon, accent, ...rest } = data

      const existing = await prisma.journeyMilestone.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`JourneyMilestone "${id}" does not exist.`)
      }

      const milestone = await prisma.journeyMilestone.update({
        where: { id },
        data: {
          ...rest,
          ...(icon !== undefined && { icon: JOURNEY_ICON_TO_DB[icon] }),
          ...(accent !== undefined && { accent: mapAccentColorToDb(accent) }),
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'update', entity: 'JourneyMilestone', entityId: id })

      return milestone
    },
    'update-journey-milestone',
  )
}
