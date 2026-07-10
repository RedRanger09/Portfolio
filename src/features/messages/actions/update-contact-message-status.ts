'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { updateContactMessageStatusSchema } from '../schemas/contact-message.schema'

export async function updateContactMessageStatus(input: unknown): Promise<MutationResult<{ id: string; status: string }>> {
  await assertAdminAccess()

  return runMutation(updateContactMessageStatusSchema, input, async ({ id, status }) => {
    const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } })
    if (!existing) throw new MutationNotFoundError()

    const message = await prisma.contactMessage.update({ where: { id }, data: { status } })
    await recordAuditEvent({ action: 'update', entity: 'ContactMessage', entityId: id })
    return { id: message.id, status: message.status }
  }, 'update-contact-message-status')
}
