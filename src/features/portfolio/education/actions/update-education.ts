'use server'

import type { Education } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { EDUCATION_TYPE_TO_DB } from '../data'
import { updateEducationSchema } from '../schemas/education.schema'

/** Partially updates an existing `Education` entry. Single-table write — no transaction needed. */
export async function updateEducation(input: unknown): Promise<MutationResult<Education>> {
  await assertAdminAccess()

  return runMutation(
    updateEducationSchema,
    input,
    async (data) => {
      const { id, type, shortName, expectedGraduation, currentSemester, ...rest } = data

      const existing = await prisma.education.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`Education "${id}" does not exist.`)
      }

      const education = await prisma.education.update({
        where: { id },
        data: {
          ...rest,
          ...(type !== undefined && { type: EDUCATION_TYPE_TO_DB[type] }),
          ...(shortName !== undefined && { shortName: shortName || null }),
          ...(expectedGraduation !== undefined && { expectedGraduation: expectedGraduation || null }),
          ...(currentSemester !== undefined && { currentSemester: currentSemester || null }),
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'update', entity: 'Education', entityId: id })

      return education
    },
    'update-education',
  )
}
