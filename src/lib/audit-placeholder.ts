/**
 * Placeholder for the future audit-log system.
 *
 * Audit logging is explicitly out of scope for Phase 5.4 (`docs/infrastructure/phase-5-4-implementation-notes.md`)
 * — this exists so every mutation already has a single, real call site to
 * extend, instead of a comment repeated in 20+ files. Every action that
 * successfully creates, updates, or deletes a row calls this immediately
 * after the write succeeds (inside the same transaction where one is
 * used, so a future real implementation can insert an `AuditLog` row
 * atomically with the change it's describing).
 *
 * Currently a no-op. `docs/architecture/domain-model.md`'s `AuditLog`
 * entity (actor, action, entity/entityId, before/after snapshot,
 * timestamp) is the intended eventual body of this function — at that
 * point `actorId` below stops being optional (it comes from
 * `auth-placeholder.ts`'s real Clerk session).
 */

export interface AuditEvent {
  action: 'create' | 'update' | 'delete'
  /** Prisma model name, e.g. `"Project"`, `"Hero"`. */
  entity: string
  entityId: string
  /** @future Populated once `assertAdminAccess` (`src/lib/auth-placeholder.ts`) returns a real user. */
  actorId?: string
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  // TODO(audit): persist `event` to an `AuditLog` table once it exists.
  void event
  return
}
