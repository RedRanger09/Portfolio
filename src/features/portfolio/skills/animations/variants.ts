import type { TargetAndTransition, Transition } from 'framer-motion'

/** Named Framer Motion configs for the Skills grid. */

export function skillPanelReveal(index: number) {
  return {
    initial: { opacity: 0, y: 20 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    viewport: { once: true, amount: 0.2 },
    transition: { delay: index * 0.07 } satisfies Transition,
  }
}

export const skillLogoHover = {
  whileHover: { scale: 1.15, y: -2 } satisfies TargetAndTransition,
}
