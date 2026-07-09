'use client'

import { motion } from 'framer-motion'
import { timelineLineReveal } from '../animations/variants'

/** The animated vertical gradient line running behind the timeline entries. */
export function EducationTimelineLine() {
  return (
    <motion.div
      {...timelineLineReveal}
      aria-hidden="true"
      className="absolute left-5 top-0 h-full w-px origin-top bg-gradient-to-b from-purple-500/60 via-cyan-500/40 to-transparent sm:left-6"
    />
  )
}
