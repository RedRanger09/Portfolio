'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteProjectSchema } from '../schemas/project.schema'

/**
 * Deletes a `Project`. Its `ProjectTechnology` join rows cascade
 * (`onDelete: Cascade` in `prisma/schema.prisma`) — no separate cleanup
 * step, and no transaction needed for a single-statement delete.
 */
export async function deleteProject(input: unknown): Promise<MutationResult<{ id: string }>> {
  await assertAdminAccess()

  return runMutation(
    deleteProjectSchema,
    input,
    async ({ id }) => {
      const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } })
      if (!existing) {
        throw new MutationNotFoundError(`Project "${id}" does not exist.`)
      }

      await prisma.project.delete({ where: { id } })

      // TODO(audit): once the audit system exists, this call starts writing real rows.
      await recordAuditEvent({ action: 'delete', entity: 'Project', entityId: id })

      return { id }
    },
    'delete-project',
  )
}
