'use server'

import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { sendContactNotificationEmail } from '@/lib/resend'
import { assertContactSubmissionAllowed } from '../lib/contact-rate-limit'
import { createContactMessageSchema } from '../schemas/contact-message.schema'

const DEFAULT_SUBJECT = 'Portfolio contact'

/**
 * Public visitor contact submission — no authentication.
 * Persists a `ContactMessage` (source of truth), then best-effort emails via Resend.
 * Protected with honeypot, timing, and soft per-IP rate limiting.
 */
export async function createContactMessage(
  input: unknown,
): Promise<MutationResult<{ id: string }>> {
  return runMutation(
    createContactMessageSchema,
    input,
    async (data) => {
      // Honeypot filled → pretend success so bots learn nothing useful.
      if (data.website.trim().length > 0) {
        return { id: 'ok' }
      }

      await assertContactSubmissionAllowed({ formStartedAt: data.formStartedAt })

      const created = await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          subject: DEFAULT_SUBJECT,
          body: data.message,
          status: 'UNREAD',
        },
        select: { id: true, createdAt: true },
      })

      // Email is optional — never roll back a successful save.
      await sendContactNotificationEmail({
        name: data.name,
        email: data.email,
        message: data.message,
        createdAt: created.createdAt,
      })

      return { id: created.id }
    },
    'create-contact-message',
  )
}
