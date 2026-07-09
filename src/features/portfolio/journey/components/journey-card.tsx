'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ACCENT_CLASSES, ACCENT_BORDER_LEFT_CLASS } from '@/constants/theme'
import { cn } from '@/shared/utils'
import { cardReveal, chevronRotate, expandCollapse } from '../animations/variants'
import type { JourneyStep } from '../types'

interface JourneyCardProps {
  step: JourneyStep
  index: number
}

/** Collapsible milestone card — click the header to reveal the full description and tags. */
export function JourneyCard({ step, index }: JourneyCardProps) {
  const [expanded, setExpanded] = useState(false)
  const accent = ACCENT_CLASSES[step.accent]

  return (
    <motion.div
      {...cardReveal(index)}
      className={cn(
        'mb-6 flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/70 transition-all',
        step.isCurrent && `border-l-2 ${ACCENT_BORDER_LEFT_CLASS[step.accent]}`,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {step.isCurrent && (
              <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${accent.bg} ${accent.text}`}>Current</span>
            )}
            <span className="font-mono text-[0.65rem] text-zinc-500">{step.year}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-white sm:text-base">{step.label}</p>
        </div>
        <motion.div {...chevronRotate(expanded)}>
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div {...expandCollapse} className="overflow-hidden">
            <div className="border-t border-white/[0.06] px-5 pb-5 pt-3">
              <p className="text-sm leading-relaxed text-zinc-400">{step.description}</p>
              {step.subItems && step.subItems.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {step.subItems.map((tag) => (
                    <li key={tag} className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accent.border} ${accent.text} ${accent.bg}`}>
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
