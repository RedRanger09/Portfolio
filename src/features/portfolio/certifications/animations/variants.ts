import type { TargetAndTransition, Transition } from 'framer-motion'

/** Named Framer Motion configs for the Certifications grid. */

export function certificationCardReveal(index: number) {
  return {
    initial: { opacity: 0, y: 16 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    viewport: { once: true },
    whileHover: { y: -6, scale: 1.01 } satisfies TargetAndTransition,
    transition: { delay: index * 0.05 } satisfies Transition,
  }
}
