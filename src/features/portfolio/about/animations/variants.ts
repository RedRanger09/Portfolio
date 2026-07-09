import type { TargetAndTransition, Transition } from 'framer-motion'

/**
 * Named Framer Motion configs for the About section, spread directly onto
 * `motion.*` components. Mirrors the pattern established in `hero/animations` —
 * one place to tune every entrance/hover timing for this feature.
 */

/** Story paragraphs fade in one after another as the section scrolls into view. */
export function storyLineReveal(index: number) {
  return {
    initial: { opacity: 0, y: 10 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    viewport: { once: true },
    transition: { delay: index * 0.05 } satisfies Transition,
  }
}

export const currentlyLearningReveal = {
  initial: { opacity: 0, x: 16 } satisfies TargetAndTransition,
  whileInView: { opacity: 1, x: 0 } satisfies TargetAndTransition,
  viewport: { once: true },
}

export const interestChipHover = {
  whileHover: { scale: 1.05 } satisfies TargetAndTransition,
}
