import type { TargetAndTransition, Transition } from 'framer-motion'

/**
 * Named Framer Motion configs for the Projects section, spread directly onto
 * `motion.*` components. Mirrors the pattern established in `hero/animations`
 * and `about/animations`.
 */

export const featuredProjectReveal = {
  initial: { opacity: 0, y: 18 } satisfies TargetAndTransition,
  whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
  viewport: { once: true, amount: 0.15 },
}

/** Grid cards stagger in and lift slightly on hover. */
export function projectCardReveal(index: number) {
  return {
    initial: { opacity: 0, y: 16 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, y: 0 } satisfies TargetAndTransition,
    viewport: { once: true, amount: 0.15 },
    whileHover: { y: -6 } satisfies TargetAndTransition,
    transition: { delay: index * 0.05 } satisfies Transition,
  }
}

/** The browser-chrome mockup's own hover lift + inner image zoom (used by the featured showcase). */
export function browserMockupHover(shouldReduceMotion: boolean) {
  return {
    whileHover: shouldReduceMotion ? undefined : ({ y: -4 } satisfies TargetAndTransition),
    transition: { duration: 0.3 } satisfies Transition,
  }
}

export function browserMockupImageHover(shouldReduceMotion: boolean) {
  return {
    whileHover: shouldReduceMotion ? undefined : ({ scale: 1.02 } satisfies TargetAndTransition),
    transition: { duration: 0.4 } satisfies Transition,
  }
}
