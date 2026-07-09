import type { TargetAndTransition } from 'framer-motion'

/** Named Framer Motion config for the Resume preview card's hover lift. */
export function resumePreviewHover(shouldReduceMotion: boolean) {
  return {
    whileHover: shouldReduceMotion ? undefined : ({ y: -4 } satisfies TargetAndTransition),
  }
}
