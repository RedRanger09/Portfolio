'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { getSectionTheme, ACCENT_TEXT_CLASS } from '@/constants/theme'

interface SectionHeaderProps {
  label?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  theme?: string
}

/**
 * Standard section heading: eyebrow label, `<h2>` title, optional subtitle,
 * plus a soft themed glow. Every section below Hero uses this to keep
 * heading style consistent while still expressing its own accent color.
 */
export function SectionHeader({ label, title, subtitle, align = 'left', theme = 'hero' }: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion()
  const { accent, glow } = getSectionTheme(theme)
  const accentClass = ACCENT_TEXT_CLASS[accent]

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative mb-14 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl"
        style={{ background: glow }}
        aria-hidden="true"
      />
      {label && <p className={`font-mono text-xs uppercase tracking-widest ${accentClass}`}>{label}</p>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-zinc-400">{subtitle}</p>}
    </motion.header>
  )
}
