'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ACCENT_CLASSES } from '@/constants/theme'
import { JOURNEY_ICONS } from '../constants/icons'
import { iconNodeReveal, currentStepPulse } from '../animations/variants'
import type { JourneyStep } from '../types'

interface JourneyIconNodeProps {
  step: JourneyStep
  index: number
}

/** The circular icon marker on the timeline — pulses if this is the current milestone. */
export function JourneyIconNode({ step, index }: JourneyIconNodeProps) {
  const shouldReduceMotion = useReducedMotion()
  const accent = ACCENT_CLASSES[step.accent]
  const Icon = JOURNEY_ICONS[step.icon]

  return (
    <motion.div
      {...iconNodeReveal(index)}
      className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${accent.border} ${accent.bg} shadow-lg`}
      style={step.isCurrent ? { boxShadow: `0 0 20px ${accent.glow}` } : undefined}
    >
      <Icon className={`h-5 w-5 ${accent.text}`} aria-hidden="true" />
      {step.isCurrent && !shouldReduceMotion && (
        <motion.div className={`absolute inset-0 rounded-full ${accent.bg}`} {...currentStepPulse} />
      )}
    </motion.div>
  )
}
