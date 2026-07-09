'use client'

import { motion } from 'framer-motion'
import { storyLineReveal } from '../animations/variants'

interface AboutStoryProps {
  lines: string[]
}

/** Left column — the "how I got here" narrative, one paragraph per line, staggered in on scroll. */
export function AboutStory({ lines }: AboutStoryProps) {
  return (
    <div className="space-y-6">
      {lines.map((line, index) => (
        <motion.p key={line} {...storyLineReveal(index)} className="text-base leading-relaxed text-zinc-400">
          {line}
        </motion.p>
      ))}
    </div>
  )
}
