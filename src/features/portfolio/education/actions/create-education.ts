'use server'

import type { Education } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { EDUCATION_TYPE_TO_DB } from '../data'
import { createEducationSchema } from '../schemas/education.schema'

/** Creates a new `Education` entry. Single-table write — no transaction needed. */
export async function createEducation(input: unknown): Promise<MutationResult<Education>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    createEducationSchema,
    input,
    async (data) => {
      const order = data.order ?? (await prisma.education.count())

      const education = await prisma.education.create({
        data: {
          type: EDUCATION_TYPE_TO_DB[data.type],
          institution: data.institution,
          shortName: data.shortName || null,
          degree: data.degree,
          period: data.period,
          location: data.location,
          description: data.description,
          highlights: data.highlights,
          expectedGraduation: data.expectedGraduation || null,
          currentSemester: data.currentSemester || null,
          order,
        },
      })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'create', entity: 'Education', entityId: education.id })

      return education
    },
    'create-education',
  )
}
