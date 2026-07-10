'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteJourneyMilestoneSchema } from '../schemas/journey-milestone.schema'

/** Deletes a `JourneyMilestone`. Single-table delete — no transaction needed. */
export async function deleteJourneyMilestone(input: unknown): Promise<MutationResult<{ id: string }>> {
  await assertAdminAccess()

  return runMutation(
    deleteJourneyMilestoneSchema,
    input,
    async ({ id }) => {
      const existing = await prisma.journeyMilestone.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`JourneyMilestone "${id}" does not exist.`)
      }

      await prisma.journeyMilestone.delete({ where: { id } })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'delete', entity: 'JourneyMilestone', entityId: id })

      return { id }
    },
    'delete-journey-milestone',
  )
}
