'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SITE } from '@/config/site.config'
import { SPRING_FAST } from '@/constants/animation'

/** Logo mark + name/role, linking back to the hero section. */
export function NavBrand() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <a
      href="#top"
      className="group flex min-w-0 items-center gap-2.5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
      aria-label={`Go to ${SITE.name} portfolio`}
    >
      <motion.span
        whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.93 }}
        transition={SPRING_FAST}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-400 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.22)]"
      >
        AT
      </motion.span>
      <span className="hidden min-w-0 sm:block">
        <span className="block truncate text-sm font-semibold leading-tight tracking-tight">{SITE.name}</span>
        <span className="block truncate font-mono text-[0.6rem] leading-tight text-zinc-500">{SITE.role}</span>
      </span>
    </a>
  )
}
