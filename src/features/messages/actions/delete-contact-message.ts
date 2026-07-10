'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { deleteContactMessageSchema } from '../schemas/contact-message.schema'

export async function deleteContactMessage(input: unknown): Promise<MutationResult<{ id: string }>> {
  await assertAdminAccess()

  return runMutation(deleteContactMessageSchema, input, async ({ id }) => {
    const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new MutationNotFoundError()

    await prisma.contactMessage.delete({ where: { id } })
    await recordAuditEvent({ action: 'delete', entity: 'ContactMessage', entityId: id })
    return { id }
  }, 'delete-contact-message')
}
