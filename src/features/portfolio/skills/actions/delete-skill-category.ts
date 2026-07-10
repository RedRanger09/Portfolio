'use server'

import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteSkillCategorySchema } from '../schemas/skill-category.schema'

/** Deletes a `SkillCategory`. Its `Skill` join rows cascade (`onDelete: Cascade`) — no separate cleanup step. */
export async function deleteSkillCategory(input: unknown): Promise<MutationResult<{ id: string }>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    deleteSkillCategorySchema,
    input,
    async ({ id }) => {
      const existing = await prisma.skillCategory.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`SkillCategory "${id}" does not exist.`)
      }

      await prisma.skillCategory.delete({ where: { id } })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'delete', entity: 'SkillCategory', entityId: id })

      return { id }
    },
    'delete-skill-category',
  )
}
