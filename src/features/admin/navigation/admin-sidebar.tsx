'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { cn } from '@/shared/utils'
import { ADMIN_NAV_GROUPS, isAdminNavItemActive } from './admin-nav-items'

/**
 * Persistent desktop sidebar (`lg:` and up — see `admin-mobile-nav.tsx`
 * for the small-screen equivalent). A client component because
 * highlighting the active module requires the current pathname
 * (`usePathname`), the same justification the public `Navbar` uses for
 * `useActiveSection` — there's no Server Component API for "what route
 * am I currently rendering under."
 */
export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.08] lg:bg-surface/40">
      <Link
        href="/admin"
        className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-white">Admin</span>
      </Link>

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 py-4">
        {ADMIN_NAV_GROUPS.map((group, index) => (
          <div key={group.label ?? `group-${index}`} className={index > 0 ? 'mt-6' : undefined}>
            {group.label && (
              <p className="px-2.5 pb-2 font-mono text-[0.65rem] uppercase tracking-widest text-zinc-500">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isAdminNavItemActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                        isActive ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'opacity-60')} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
