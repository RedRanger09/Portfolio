import 'server-only'

import { headers } from 'next/headers'
import { MutationValidationError } from '@/lib/mutation-result'

/** Soft per-instance limit — bots still need honeypot + timing; this slows bursts. */
const WINDOW_MS = 15 * 60 * 1000
const MAX_PER_WINDOW = 5
const MIN_FORM_AGE_MS = 2_000

const buckets = new Map<string, { count: number; resetAt: number }>()

/**
 * Throws `MutationValidationError` when the submission is too fast or
 * too frequent from this runtime instance (best-effort on serverless).
 */
export async function assertContactSubmissionAllowed(input: {
  formStartedAt: number
}): Promise<void> {
  const age = Date.now() - input.formStartedAt
  if (!Number.isFinite(input.formStartedAt) || age < MIN_FORM_AGE_MS || age > 24 * 60 * 60 * 1000) {
    throw new MutationValidationError(
      { _root: ['Please wait a moment and try again.'] },
      'Please wait a moment and try again.',
    )
  }

  const h = await headers()
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = h.get('x-real-ip')?.trim()
  const key = `contact:${forwarded || realIp || 'anonymous'}`

  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (current.count >= MAX_PER_WINDOW) {
    throw new MutationValidationError(
      { _root: ['Too many messages. Please try again later.'] },
      'Too many messages. Please try again later.',
    )
  }

  current.count += 1
}
