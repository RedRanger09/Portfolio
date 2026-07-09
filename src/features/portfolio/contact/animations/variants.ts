import type { TargetAndTransition, Transition } from 'framer-motion'

/** Named Framer Motion configs for the Contact section. */

export function contactMethodReveal(index: number) {
  return {
    initial: { opacity: 0, y: 14 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    viewport: { once: true },
    transition: { delay: index * 0.06 } satisfies Transition,
  }
}

export const contactCtaReveal = {
  initial: { opacity: 0, y: 10 } satisfies TargetAndTransition,
  whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
  viewport: { once: true },
}
