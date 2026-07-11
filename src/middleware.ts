import { clerkMiddleware } from '@clerk/nextjs/server'

/**
 * Initializes Clerk and requires a signed-in session for `/admin`.
 *
 * Owner authorization (`ADMIN_EMAIL`) remains in `assertAdminAccess` on the
 * admin layout and Server Actions — middleware only blocks anonymous traffic.
 */
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
