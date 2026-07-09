import type { TargetAndTransition, Transition } from 'framer-motion'

/** Named Framer Motion configs for the Journey timeline. */

export function iconNodeReveal(index: number) {
  return {
    initial: { opacity: 0, scale: 0.6 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, scale: 1 } satisfies TargetAndTransition,
    viewport: { once: true, amount: 0.5 },
    transition: { delay: index * 0.04, type: 'spring', stiffness: 200 } satisfies Transition,
  }
}

export const currentStepPulse = {
  animate: { scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] } satisfies TargetAndTransition,
  transition: { duration: 2, repeat: Infinity } satisfies Transition,
}

export function cardReveal(index: number) {
  return {
    initial: { opacity: 0, x: -16 } satisfies TargetAndTransition,
    whileInView: { opacity: 1, x: 0 } satisfies TargetAndTransition,
    viewport: { once: true, amount: 0.3 },
    transition: { delay: index * 0.04 + 0.05 } satisfies Transition,
  }
}

export function chevronRotate(expanded: boolean) {
  return {
    animate: { rotate: expanded ? 180 : 0 } satisfies TargetAndTransition,
    transition: { duration: 0.2 } satisfies Transition,
  }
}

export const expandCollapse = {
  initial: { height: 0, opacity: 0 } satisfies TargetAndTransition,
  animate: { height: 'auto', opacity: 1 } satisfies TargetAndTransition,
  exit: { height: 0, opacity: 0 } satisfies TargetAndTransition,
  transition: { duration: 0.25 } satisfies Transition,
}
