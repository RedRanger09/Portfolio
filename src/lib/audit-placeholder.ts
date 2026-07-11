/**
 * Placeholder for the future audit-log system.
 *
 * Every successful create/update/delete calls this after the write so a
 * future `AuditLog` table can be wired in one place. Also triggers public
 * cache revalidation so CMS changes appear without a redeploy.
 */

import { revalidatePublicContent } from '@/lib/revalidate-public'

export interface AuditEvent {
  action: 'create' | 'update' | 'delete'
  /** Prisma model name, e.g. `"Project"`, `"Hero"`. */
  entity: string
  entityId: string
  /** @future Populated from the authenticated Clerk session. */
  actorId?: string
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  // TODO(audit): persist `event` to an `AuditLog` table once it exists.
  void event
  revalidatePublicContent()
}
