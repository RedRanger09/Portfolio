'use server'

import type { Resume } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { updateResumeSchema } from '../schemas/resume.schema'

/** Replaces the singleton `Resume` row's content — see `update-hero.ts` for why this is an upsert-by-lookup, not a true `upsert`. */
export async function updateResume(input: unknown): Promise<MutationResult<Resume>> {
  await assertAdminAccess()

  return runMutation(
    updateResumeSchema,
    input,
    async (data) => {
      const existing = await prisma.resume.findFirst({ select: { id: true } })

      const resume = existing
        ? await prisma.resume.update({ where: { id: existing.id }, data })
        : await prisma.resume.create({ data })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: existing ? 'update' : 'create', entity: 'Resume', entityId: resume.id })

      return resume
    },
    'update-resume',
  )
}
