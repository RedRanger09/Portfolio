'use server'

import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteEducationSchema } from '../schemas/education.schema'

/** Deletes an `Education` entry. Single-table delete — no transaction needed. */
export async function deleteEducation(input: unknown): Promise<MutationResult<{ id: string }>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    deleteEducationSchema,
    input,
    async ({ id }) => {
      const existing = await prisma.education.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`Education "${id}" does not exist.`)
      }

      await prisma.education.delete({ where: { id } })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'delete', entity: 'Education', entityId: id })

      return { id }
    },
    'delete-education',
  )
}
