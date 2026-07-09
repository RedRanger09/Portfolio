/**
 * Health-check endpoint.
 *
 * Polled externally by an uptime monitor (Better Uptime — see
 * `docs/infrastructure/deployment-and-operations.md §4`) and useful as a
 * quick manual check after any deploy or local env change: hit
 * `/api/health` and confirm `database.ok` is `true`.
 *
 * `force-dynamic` is required, not cosmetic: without it, Next.js may try
 * to statically render this route at build time, which would attempt a
 * database connection during `next build` and fail the build whenever
 * `DATABASE_URL` isn't available in that environment (e.g. CI without a
 * database branch). A health check must always run at request time.
 */

import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db-health'

export const dynamic = 'force-dynamic'

export async function GET() {
  const database = await checkDatabaseConnection()

  return NextResponse.json(
    {
      status: database.ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
    },
    { status: database.ok ? 200 : 503 },
  )
}
