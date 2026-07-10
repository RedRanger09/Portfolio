import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { AdminMobileNav } from '../navigation/admin-mobile-nav'
import { AdminBreadcrumbs } from '../navigation/admin-breadcrumbs'
import { AdminUserMenu } from './admin-user-menu'

/** Server Component — composes client nav pieces and the Clerk account menu. */
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
        <AdminUserMenu />
      </div>
    </header>
  )
}
