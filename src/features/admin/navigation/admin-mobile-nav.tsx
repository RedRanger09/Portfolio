'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { cn } from '@/shared/utils'
import { SPRING_FAST } from '@/constants/animation'
import { ADMIN_NAV_GROUPS, isAdminNavItemActive } from './admin-nav-items'

/**
 * Below `lg:`, the persistent sidebar (`AdminSidebar`) is hidden entirely
 * and this owns both the hamburger trigger and the off-canvas drawer as
 * one self-contained unit — deliberately not split into two components
 * sharing lifted state (the way the public Navbar splits
 * `MobileNavToggle`/`MobileNavDrawer`), because here both pieces have
 * exactly one consumer (`AdminTopbar`) and no sibling needs the `open`
 * state, so there's nothing to lift it *to*.
 */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
        aria-label={open ? 'Close admin navigation menu' : 'Open admin navigation menu'}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white transition-colors hover:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              id="admin-mobile-menu"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={SPRING_FAST}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-white/[0.08] bg-background"
            >
              <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-5">
                <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold tracking-tight text-white">Admin</span>
              </div>

              <nav aria-label="Admin sections" className="flex-1 px-3 py-4">
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
                              onClick={() => setOpen(false)}
                              aria-current={isActive ? 'page' : undefined}
                              className={cn(
                                'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
