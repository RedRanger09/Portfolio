import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { AppProviders } from '@/providers'
import { AdminShell } from '@/features/admin/layout'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin',
  },
  description: 'Portfolio content administration.',
  // Never index the admin surface, regardless of what the public site's metadata does.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
}

/**
 * `/admin`'s own root layout — its own `<html>`/`<body>`, independent of
 * `(site)/layout.tsx`. Two root layouts is a deliberate Next.js App
 * Router pattern (route groups + a plain top-level `admin/` folder, no
 * shared `app/layout.tsx`) for exactly this situation: a public marketing
 * shell and an admin dashboard shell that don't share a single element
 * of chrome. See `(site)/layout.tsx` for the full reasoning and
 * `app/global-not-found.tsx` for the one thing that pattern costs you.
 *
 * ---
 * **Authentication boundary (documented, not implemented — see brief):**
 * `assertAdminAccess()` (`@/lib/auth-placeholder`) is called here as the
 * *route-level* gate for every `/admin/*` page — today a no-op, so every
 * admin route is reachable by anyone who knows the URL. This is in
 * addition to, not a replacement for, the *action-level* calls already
 * wired into every Server Action in Phase 5.4 (`create-project`,
 * `update-hero`, etc.) — defense in depth once both are real: a leaked or
 * misconfigured route still can't mutate data if the action's own check
 * also fails closed. When Clerk lands, this single call becomes a real
 * `redirect('/sign-in')` (or a `middleware.ts` check ahead of this layout
 * entirely, if session state needs to be read before any admin code
 * runs) — nothing else in `app/admin/**` changes.
 *
 * **RBAC boundary (not implemented — extension point only):** once
 * `assertAdminAccess()` is real, a role check (e.g. "editor" vs
 * "owner") would compose the same way — either inside
 * `assertAdminAccess()` itself (coarse: "is this user an admin at all"),
 * or as a second, per-module check inside individual pages/actions for
 * finer-grained permissions (e.g. "can this user publish, or only
 * draft"). No role model exists yet, so there's nothing to branch on today.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await assertAdminAccess()

  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AppProviders>
          <AdminShell>{children}</AdminShell>
        </AppProviders>
      </body>
    </html>
  )
}
