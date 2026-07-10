import { clerkMiddleware } from '@clerk/nextjs/server'

/**
 * Initializes Clerk on matched requests. Auth gating is intentionally *not*
 * done here — Clerk deprecated middleware path matching (`createRouteMatcher`)
 * in favor of resource-based checks. `/admin` protection lives in
 * `assertAdminAccess('route')` (admin layout) and `assertAdminAccess()`
 * (Server Actions).
 */
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
