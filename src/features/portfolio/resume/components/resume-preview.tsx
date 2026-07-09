'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { resumePreviewHover } from '../animations/variants'

interface ResumePreviewProps {
  src: string
  alt: string
  width: number
  height: number
}

/** Full resume preview image with a soft ambient glow and a hover lift. */
export function ResumePreview({ src, alt, width, height }: ResumePreviewProps) {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <motion.div
      {...resumePreviewHover(shouldReduceMotion)}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.10),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.08),transparent_50%)]" />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="relative h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
      />
    </motion.div>
  )
}
