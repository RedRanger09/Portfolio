'use server'

import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteCertificationSchema } from '../schemas/certification.schema'

/** Deletes a `Certification`. Single-table delete — no transaction needed. */
export async function deleteCertification(input: unknown): Promise<MutationResult<{ id: string }>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    deleteCertificationSchema,
    input,
    async ({ id }) => {
      const existing = await prisma.certification.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`Certification "${id}" does not exist.`)
      }

      await prisma.certification.delete({ where: { id } })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'delete', entity: 'Certification', entityId: id })

      return { id }
    },
    'delete-certification',
  )
}
