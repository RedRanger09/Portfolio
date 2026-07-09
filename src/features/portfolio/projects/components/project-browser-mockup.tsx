'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { browserMockupHover, browserMockupImageHover } from '../animations/variants'

interface ProjectBrowserMockupProps {
  src: string
  alt: string
  title?: string
}

/**
 * Browser-chrome-style screenshot embed for the featured project. Lifts
 * slightly on hover, with the screenshot itself zooming a touch more —
 * feature-internal since nothing else currently uses this framing.
 */
export function ProjectBrowserMockup({ src, alt, title = 'project preview' }: ProjectBrowserMockupProps) {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <motion.div
      {...browserMockupHover(shouldReduceMotion)}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface shadow-card"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-background px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" aria-hidden="true" />
        <span className="ml-2 truncate font-mono text-[0.65rem] text-zinc-500">{title}</span>
      </div>
      <motion.div
        {...browserMockupImageHover(shouldReduceMotion)}
        className="relative aspect-video overflow-hidden bg-background"
      >
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
      </motion.div>
    </motion.div>
  )
}
