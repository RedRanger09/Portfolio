'use server'

import type { Certification } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { updateCertificationSchema } from '../schemas/certification.schema'

/** Partially updates an existing `Certification`. Single-table write — no transaction needed. */
export async function updateCertification(input: unknown): Promise<MutationResult<Certification>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    updateCertificationSchema,
    input,
    async (data) => {
      const { id, providerLogo, completionDate, ...rest } = data

      const existing = await prisma.certification.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`Certification "${id}" does not exist.`)
      }

      const certification = await prisma.certification.update({
        where: { id },
        data: {
          ...rest,
          ...(providerLogo !== undefined && { providerLogo: providerLogo || null }),
          ...(completionDate !== undefined && { completionDate: completionDate || null }),
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'update', entity: 'Certification', entityId: id })

      return certification
    },
    'update-certification',
  )
}
