import type { Prisma } from '@prisma/client'

/**
 * Prisma's `InputJsonValue` requires a generic index signature that a
 * concrete app type (`InterestCard[]`, `ProjectMetric[]`, …) doesn't
 * structurally have. Every value passed through here is one of this
 * codebase's own plain-data types — either already validated by a Zod
 * schema (mutation actions) or one of this app's own `FALLBACK_*`
 * constants (`prisma/seed.ts`) — never arbitrary/untrusted input, so the
 * cast is safe. This just tells Prisma "store this as JSON."
 */
export function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue
}
