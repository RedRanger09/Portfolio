import type { TargetAndTransition, Transition } from 'framer-motion'

/** Named Framer Motion configs for the Education timeline. */

export const timelineLineReveal = {
  initial: { scaleY: 0 } satisfies TargetAndTransition,
  whileInView: { scaleY: 1 } satisfies TargetAndTransition,
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 1.2, ease: 'easeInOut' } satisfies Transition,
}

export function entryReveal(index: number) {
  return {
    initial: { opacity: 0, x: -20 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, x: 0 } satisfies TargetAndTransition,
    viewport: { once: true, amount: 0.3 },
    transition: { delay: index * 0.15 } satisfies Transition,
  }
}

export const entryCardHover = {
  whileHover: { x: 4 } satisfies TargetAndTransition,
  transition: { duration: 0.2 } satisfies Transition,
}
