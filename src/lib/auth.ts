import 'server-only'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { env } from '@/config/env'
import { MutationForbiddenError } from '@/lib/mutation-result'

export type AssertAdminAccessMode = 'route' | 'mutation'

export interface AuthenticatedAdmin {
  userId: string
  email: string
}

/**
 * Authentication only — verifies a Clerk session exists and the account
 * has a primary email. Does not check ownership.
 *
 * RBAC extension point: a future role model would compose *after* this
 * call, not inside it — authentication (who are you?) stays separate
 * from authorization (what may you do?).
 */
export async function requireAuthenticatedSession(): Promise<AuthenticatedAdmin> {
  const { userId } = await auth()

  if (!userId) {
    throw new MutationForbiddenError('Authentication required.')
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  if (!email) {
    throw new MutationForbiddenError('A verified email address is required.')
  }

  return { userId, email }
}

/**
 * Authorization only — compares the authenticated email against
 * `env.adminEmail`. Authentication must already have succeeded.
 *
 * RBAC extension point: replace or extend this function with role/permission
 * checks once a role model exists. `requireAuthenticatedSession()` stays
 * unchanged; middleware only initializes Clerk (no route gating).
 */
export function authorizeOwnerAccess(email: string): void {
  const ownerEmail = env.adminEmail

  if (!ownerEmail) {
    throw new MutationForbiddenError('Admin access is not configured.')
  }

  if (email.trim().toLowerCase() !== ownerEmail.trim().toLowerCase()) {
    throw new MutationForbiddenError('You do not have permission to access the admin area.')
  }
}

function denyAccess(mode: AssertAdminAccessMode, error: MutationForbiddenError): never {
  if (mode === 'route') {
    if (error.message === 'Authentication required.' || error.message === 'A verified email address is required.') {
      redirect('/sign-in')
    }

    redirect('/unauthorized')
  }

  throw error
}

/**
 * Single authorization entry point for every admin route and Server Action.
 *
 * - `route` (admin layout): redirects unauthenticated users to `/sign-in`
 *   and authenticated non-owners to `/unauthorized`.
 * - `mutation` (Server Actions, default): throws `MutationForbiddenError`
 *   so `runMutation()` can return a typed `FORBIDDEN` result.
 */
export async function assertAdminAccess(mode: AssertAdminAccessMode = 'mutation'): Promise<AuthenticatedAdmin> {
  try {
    const session = await requireAuthenticatedSession()
    authorizeOwnerAccess(session.email)
    return session
  } catch (error) {
    if (error instanceof MutationForbiddenError) {
      denyAccess(mode, error)
    }

    throw error
  }
}
