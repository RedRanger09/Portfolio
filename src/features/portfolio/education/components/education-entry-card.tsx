'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { entryReveal, entryCardHover } from '../animations/variants'
import type { EducationEntry } from '../types'

interface EducationEntryCardProps {
  entry: EducationEntry
  index: number
}

/** One timeline entry: icon node + card with period, degree, description, and highlight tags. */
export function EducationEntryCard({ entry, index }: EducationEntryCardProps) {
  const isCollege = entry.type === 'college'

  return (
    <motion.div {...entryReveal(index)} className="relative flex gap-6 sm:gap-8">
      <div
        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg ${
          isCollege ? 'border-purple-500/40 bg-purple-500/15' : 'border-cyan-500/30 bg-cyan-500/10'
        }`}
      >
        <GraduationCap className={`h-5 w-5 ${isCollege ? 'text-purple-400' : 'text-cyan-400'}`} aria-hidden="true" />
      </div>

      <motion.div
        {...entryCardHover}
        className={`flex-1 overflow-hidden rounded-2xl border bg-surface/70 p-6 ${isCollege ? 'border-purple-500/20' : 'border-white/[0.08]'}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className={`font-mono text-xs ${isCollege ? 'text-purple-400' : 'text-cyan-400'}`}>{entry.period}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{entry.degree}</h3>
            <p className="text-sm text-zinc-400">{isCollege ? entry.shortName : entry.institution}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{entry.location}</p>
          </div>
          {entry.currentSemester && (
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
              {entry.currentSemester}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">{entry.description}</p>
        {isCollege && entry.expectedGraduation && (
          <p className="mt-1 text-xs text-zinc-600">Expected graduation: {entry.expectedGraduation}</p>
        )}
        <ul className="mt-4 flex flex-wrap gap-2">
          {entry.highlights.map((highlight) => (
            <li
              key={highlight}
              className={`rounded-full border px-3 py-1 text-xs ${isCollege ? 'border-purple-500/15 text-zinc-400' : 'border-white/[0.08] text-zinc-500'}`}
            >
              {highlight}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
