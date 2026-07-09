/**
 * Shared Framer Motion presets — durations, easings, and viewport thresholds
 * reused across sections to keep motion consistent and centrally tunable.
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
}

export const revealViewport = {
  once: true,
  amount: 0.24,
}

export const defaultTransition = {
  duration: 0.55,
  ease: 'easeOut',
}

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

/** Spring presets reused by interactive nav/button micro-interactions. */
export const SPRING_SMOOTH = { type: 'spring', stiffness: 420, damping: 36 } as const
export const SPRING_FAST = { type: 'spring', stiffness: 550, damping: 28 } as const
