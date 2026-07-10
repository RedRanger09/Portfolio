'use server'

import type { Certification } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { createCertificationSchema } from '../schemas/certification.schema'

/** Creates a new `Certification`. Single-table write — no transaction needed. */
export async function createCertification(input: unknown): Promise<MutationResult<Certification>> {
  await assertAdminAccess()

  return runMutation(
    createCertificationSchema,
    input,
    async (data) => {
      const order = data.order ?? (await prisma.certification.count())

      const certification = await prisma.certification.create({
        data: {
          name: data.name,
          provider: data.provider,
          providerLogo: data.providerLogo || null,
          completionDate: data.completionDate || null,
          credentialUrl: data.credentialUrl,
          verifyUrl: data.verifyUrl,
          image: data.image,
          order,
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'create', entity: 'Certification', entityId: certification.id })

      return certification
    },
    'create-certification',
  )
}
