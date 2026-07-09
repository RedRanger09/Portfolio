import type { TargetAndTransition, Transition } from 'framer-motion'

/**
 * Named Framer Motion configs for the Hero section, spread directly onto
 * `motion.*` components (`<motion.div {...heroContentReveal}>`). Centralizing
 * these keeps every entrance/hover timing tunable from one file instead of
 * scattered across each component.
 */

export const heroContentReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 } satisfies Transition,
}

export const heroVisualReveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12, duration: 0.65 } satisfies Transition,
}

/** Interest cards stagger in after the reveal above finishes (base delay 0.38s). */
export function interestCardReveal(index: number) {
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: { y: -6, scale: 1.02 } satisfies TargetAndTransition,
    transition: { delay: 0.38 + index * 0.1, duration: 0.55, ease: [0.23, 1, 0.32, 1] } satisfies Transition,
  }
}

/** Gentle infinite float for the profile photo — disabled under reduced motion. */
export function profileFloat(shouldReduceMotion: boolean) {
  return {
    animate: shouldReduceMotion ? undefined : ({ y: [0, -10, 0] } satisfies TargetAndTransition),
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' } satisfies Transition,
  }
}

export const profileHover = {
  whileHover: { scale: 1.04 } satisfies TargetAndTransition,
  transition: { duration: 0.35 } satisfies Transition,
}

/** Per-orb pulse/scale loop — collapses to a static, slightly-visible state under reduced motion. */
export function techOrbPulse(delay: number, shouldReduceMotion: boolean) {
  return {
    initial: { opacity: 0, scale: 0.4 },
    animate: shouldReduceMotion
      ? ({ opacity: 0.85 } satisfies TargetAndTransition)
      : ({ opacity: [0.55, 1, 0.55], scale: [1, 1.1, 1] } satisfies TargetAndTransition),
    transition: { delay, duration: 3.5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut' } satisfies Transition,
  }
}
