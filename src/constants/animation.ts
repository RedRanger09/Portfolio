/**
 * Shared Framer Motion presets — durations, easings, and viewport thresholds
 * reused across sections to keep motion consistent and centrally tunable.
 */

/** Spring presets reused by interactive nav/button micro-interactions. */
export const SPRING_SMOOTH = { type: 'spring', stiffness: 420, damping: 36 } as const
export const SPRING_FAST = { type: 'spring', stiffness: 550, damping: 28 } as const
