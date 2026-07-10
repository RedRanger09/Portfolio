/**
 * Email (Resend) helpers for contact notifications.
 *
 * Uses Resend's HTTP API via `fetch` — no SDK dependency (architecture freeze).
 * Persistence always wins: callers must treat send failures as non-fatal.
 */

import { env } from '@/config/env'
import { SITE } from '@/config/site.config'

export interface EmailConfig {
  apiKey: string
  fromEmail: string
}

export interface ContactNotificationPayload {
  name: string
  email: string
  message: string
  createdAt: Date
}

export function isEmailConfigured(): boolean {
  return Boolean(env.resendApiKey && env.resendFromEmail)
}

/**
 * Returns the email config, or throws if Resend env vars are missing.
 * Prefer `isEmailConfigured()` + `sendContactNotificationEmail()` for soft failure.
 */
export function getEmailConfig(): EmailConfig {
  if (!isEmailConfigured()) {
    throw new Error(
      'Resend is not configured — set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local ' +
        '(see .env.example).',
    )
  }

  return {
    apiKey: env.resendApiKey!,
    fromEmail: env.resendFromEmail!,
  }
}

function escapePlainText(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\0/g, '')
}

function buildContactNotificationText(payload: ContactNotificationPayload): string {
  const timestamp = payload.createdAt.toISOString()
  return [
    'New Portfolio Contact Message',
    '',
    `Name: ${escapePlainText(payload.name)}`,
    `Email: ${escapePlainText(payload.email)}`,
    `Timestamp: ${timestamp}`,
    '',
    'Message:',
    escapePlainText(payload.message),
  ].join('\n')
}

/**
 * Best-effort Resend notification. Never throws — logs and returns false on skip/failure.
 * Recipient: `ADMIN_EMAIL` when set, otherwise `SITE.email`.
 */
export async function sendContactNotificationEmail(payload: ContactNotificationPayload): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.info('[resend] Skipping contact notification — RESEND_API_KEY / RESEND_FROM_EMAIL not configured.')
    return false
  }

  const toEmail = env.adminEmail || SITE.email
  if (!toEmail) {
    console.warn('[resend] Skipping contact notification — no ADMIN_EMAIL or SITE.email recipient.')
    return false
  }

  const { apiKey, fromEmail } = getEmailConfig()

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: payload.email,
        subject: 'New Portfolio Contact Message',
        text: buildContactNotificationText(payload),
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error(`[resend] Contact notification failed (${response.status}):`, detail || response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('[resend] Contact notification request failed:', error)
    return false
  }
}
