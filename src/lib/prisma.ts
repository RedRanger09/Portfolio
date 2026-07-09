/**
 * The single `PrismaClient` instance for the whole application.
 *
 * Standard Next.js pattern: in development, the module cache is cleared on
 * every hot-reload, which would otherwise construct a brand-new
 * `PrismaClient` (and a new set of DB connections) on every edit. Stashing
 * the instance on `globalThis` survives the reload, so dev never leaks
 * connections. In production, each serverless invocation gets a fresh
 * module scope anyway, so the global is a no-op there — this file behaves
 * correctly in both environments without any environment-specific branching
 * beyond the log verbosity below.
 *
 * Every feature's `data.ts` (once it moves off static arrays — see
 * `ARCHITECTURE.md §4`) imports `prisma` from here, never constructs its
 * own client.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
