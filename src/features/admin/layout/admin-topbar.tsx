import Link from 'next/link'
import { ArrowUpRight, UserCircle } from 'lucide-react'
import { AdminMobileNav } from '../navigation/admin-mobile-nav'
import { AdminBreadcrumbs } from '../navigation/admin-breadcrumbs'

/**
 * Server Component — the mobile nav toggle and breadcrumbs open their
 * own `"use client"` boundaries internally, so this composes them
 * without becoming a client file itself (same pattern `SiteShell` uses
 * for `Navbar`/`CursorGlow`).
 *
 * The circular placeholder on the right reserves the exact spot a real
 * account menu (avatar, name, sign-out) will occupy once Clerk lands —
 * see `app/admin/layout.tsx` for the documented `assertAdminAccess()`
 * integration point this button will eventually read its session from.
 */
export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.08] bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
      <AdminMobileNav />
      <AdminBreadcrumbs />
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:inline-flex"
        >
          View site
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-500"
          title="Account menu placeholder — arrives with Clerk authentication"
        >
          <UserCircle className="h-4 w-4" />
        </span>
      </div>
    </header>
  )
}
