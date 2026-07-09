/**
 * Database connectivity check.
 *
 * Used by `app/api/health/route.ts` (the endpoint an uptime monitor polls —
 * see `docs/infrastructure/deployment-and-operations.md §4.1`) and safe to
 * call anywhere else that needs a fast "is the database reachable right
 * now" answer without letting a connection failure throw and crash an
 * unrelated request.
 */

import { env } from '@/config/env'
import { prisma } from './prisma'

export interface DatabaseHealth {
  ok: boolean
  /** Round-trip time for the check query, in milliseconds. Omitted on failure. */
  latencyMs?: number
  /** Present only when `ok` is false — a short, safe-to-display message. */
  error?: string
}

export async function checkDatabaseConnection(): Promise<DatabaseHealth> {
  if (!env.databaseUrl) {
    return {
      ok: false,
      error: 'DATABASE_URL is not set — see .env.example.',
    }
  }

  const startedAt = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    return { ok: true, latencyMs: Date.now() - startedAt }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown database error.',
    }
  }
}
