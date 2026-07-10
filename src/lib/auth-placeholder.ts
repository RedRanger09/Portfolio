/**
 * Placeholder for the future Clerk-based admin authorization check.
 *
 * Authentication is explicitly out of scope for Phase 5.4 (`docs/infrastructure/phase-5-4-implementation-notes.md`)
 * — this exists so every mutation action already has a single, real call
 * site to gate on, instead of a comment repeated in 20+ files. Every
 * action in every feature's `actions/` folder calls this as its first
 * line, before validating input or touching the database.
 *
 * Currently a no-op: every mutation is callable by anyone who can import
 * it, which is fine today because nothing calls these actions yet (no
 * Admin UI, no API routes). Wiring up real auth later is a one-file
 * change here, not a change to every action.
 */
export async function assertAdminAccess(): Promise<void> {
  // TODO(auth, Phase 6): replace this no-op with a real Clerk check, e.g.:
  //
  //   import { auth } from '@clerk/nextjs/server'
  //
  //   const { userId } = await auth()
  //   if (!userId || !(await isAdminUser(userId))) {
  //     throw new MutationForbiddenError('Admin access required.')
  //   }
  //
  // (`MutationForbiddenError` would join `MutationNotFoundError` in
  // `src/lib/mutation-result.ts` as a new `FORBIDDEN` result type once
  // this is real.)
  return
}
