'use client'

import { motion } from 'framer-motion'
import { interestChipHover } from '../animations/variants'

interface AboutInterestsProps {
  label: string
  interests: string[]
}

/** Row of interest tag chips beneath the "Currently learning" card. */
export function AboutInterests({ label, interests }: AboutInterestsProps) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-500">{label}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {interests.map((interest) => (
          <motion.li
            key={interest}
            {...interestChipHover}
            className="rounded-full border border-white/[0.08] bg-surface/60 px-4 py-2 text-xs text-zinc-300"
          >
            {interest}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
