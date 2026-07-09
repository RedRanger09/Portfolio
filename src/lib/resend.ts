/**
 * Email (Resend) configuration placeholder.
 *
 * The Resend SDK is NOT installed yet — nothing in this file sends email.
 * Placeholder for Phase 10 (`docs/architecture/future-roadmap.md §5`, table
 * row 10), when the contact form goes live end-to-end and this file's body
 * becomes a real `new Resend(apiKey)` client.
 */

import { env } from '@/config/env'

export interface EmailConfig {
  apiKey: string
  fromEmail: string
}

export function isEmailConfigured(): boolean {
  return Boolean(env.resendApiKey && env.resendFromEmail)
}

/**
 * Returns the email config, or throws a clear, actionable error if it
 * isn't set yet — used once Phase 10 wires up the contact form's send path.
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
