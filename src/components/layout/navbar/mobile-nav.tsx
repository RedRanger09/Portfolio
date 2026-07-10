'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/shared/utils'
import { SPRING_FAST } from '@/constants/animation'
import type { NavigationItem, SectionId } from '@/shared/types'
import { NAV_ICONS } from './nav-icons'

interface MobileNavToggleProps {
  open: boolean
  onToggle: () => void
  shouldReduceMotion: boolean
}

/** Hamburger / close button that toggles the mobile drawer. */
export function MobileNavToggle({ open, onToggle, shouldReduceMotion }: MobileNavToggleProps) {
  return (
    <motion.button
      type="button"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
      transition={SPRING_FAST}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-colors hover:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:hidden"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <X className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <Menu className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

interface MobileNavDrawerProps {
  open: boolean
  scrolled: boolean
  shouldReduceMotion: boolean
  items: NavigationItem[]
  activeSection: SectionId | ''
  onNavigate: () => void
}

/** Full-width dropdown menu shown on small screens when the toggle is open. */
export function MobileNavDrawer({ open, scrolled, shouldReduceMotion, items, activeSection, onNavigate }: MobileNavDrawerProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id="mobile-menu"
          initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, height: 'auto' }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            'overflow-hidden border-t border-[var(--chrome-border)] px-4 pb-4 [backdrop-filter:blur(24px)] md:hidden',
            scrolled ? 'bg-[var(--chrome-bg)]' : 'bg-[color-mix(in_srgb,var(--color-background)_80%,transparent)]',
          )}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1.5 pt-3">
            {items.map((item) => {
              const isActive = activeSection === item.id
              const Icon = NAV_ICONS[item.id]
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    isActive
                      ? 'border border-white/[0.1] bg-white/[0.08] text-white'
                      : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200',
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                  {item.label}
                </a>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
