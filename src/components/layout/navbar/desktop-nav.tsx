'use client'

import { motion, type MotionValue } from 'framer-motion'
import { cn } from '@/shared/utils'
import { SPRING_FAST, SPRING_SMOOTH } from '@/constants/animation'
import type { NavigationItem, SectionId } from '@/shared/types'
import { NAV_ICONS } from './nav-icons'

interface DesktopNavProps {
  items: NavigationItem[]
  activeSection: SectionId | ''
  shouldReduceMotion: boolean
  pillPadding: MotionValue<number>
}

/** Desktop pill navigation with a sliding active indicator and per-item micro-interactions. */
export function DesktopNav({ items, activeSection, shouldReduceMotion, pillPadding }: DesktopNavProps) {
  return (
    <motion.div
      className="hidden items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:flex"
      style={{ padding: pillPadding }}
    >
      {items.map((item) => {
        const isActive = activeSection === item.id
        const Icon = NAV_ICONS[item.id]

        return (
          <motion.a
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'true' : undefined}
            initial={false}
            animate={isActive ? 'active' : 'idle'}
            whileHover={isActive ? 'activeHover' : 'hover'}
            whileTap="tap"
            className="relative flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                transition={shouldReduceMotion ? { duration: 0 } : SPRING_SMOOTH}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.13), 0 0 18px rgba(99,102,241,0.22), inset 0 1px 0 rgba(255,255,255,0.13)',
                }}
                aria-hidden="true"
              />
            )}

            {!isActive && !shouldReduceMotion && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                variants={{
                  idle: { opacity: 0 },
                  hover: { opacity: 1 },
                  tap: { opacity: 0.6, scale: 0.98 },
                }}
                transition={{ duration: 0.12 }}
                aria-hidden="true"
              />
            )}

            {Icon &&
              (shouldReduceMotion ? (
                <span className={cn('relative z-10 flex shrink-0', isActive ? 'opacity-90' : 'opacity-45')}>
                  <Icon className="h-3 w-3" />
                </span>
              ) : (
                <motion.span
                  className="relative z-10 flex shrink-0"
                  variants={{
                    idle: { scale: 1, opacity: 0.45 },
                    active: { scale: 1.08, opacity: 0.9 },
                    hover: { scale: 1.2, opacity: 0.8 },
                    activeHover: { scale: 1.15, opacity: 1.0 },
                    tap: { scale: 0.84, opacity: 0.65 },
                  }}
                  transition={SPRING_FAST}
                >
                  <Icon className="h-3 w-3" />
                </motion.span>
              ))}

            {shouldReduceMotion ? (
              <span className={cn('relative z-10', isActive ? 'text-white' : 'text-zinc-500')}>{item.label}</span>
            ) : (
              <motion.span
                className="relative z-10"
                variants={{
                  idle: { color: 'rgba(113,113,122,1)' },
                  active: { color: 'rgba(255,255,255,1)' },
                  hover: { color: 'rgba(212,212,216,1)' },
                  activeHover: { color: 'rgba(255,255,255,1)' },
                  tap: { color: 'rgba(161,161,170,1)' },
                }}
                transition={{ duration: 0.14 }}
              >
                {item.label}
              </motion.span>
            )}
          </motion.a>
        )
      })}
    </motion.div>
  )
}
