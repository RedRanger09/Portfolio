'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { currentlyLearningReveal } from '../animations/variants'
import type { CurrentlyLearning } from '../types'

interface AboutCurrentlyLearningProps {
  data: CurrentlyLearning
}

/** Purple-tinted highlight card listing what's currently being studied. */
export function AboutCurrentlyLearning({ data }: AboutCurrentlyLearningProps) {
  return (
    <motion.div
      {...currentlyLearningReveal}
      className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6"
    >
      <div className="flex items-center gap-2 text-purple-400">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <h3 className="font-mono text-xs uppercase tracking-wider">{data.title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {data.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
