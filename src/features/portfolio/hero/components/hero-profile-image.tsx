'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { profileFloat, profileHover } from '../animations/variants'

interface HeroProfileImageProps {
  src: string
  shouldReduceMotion: boolean
}

/** Profile photo with its glow ring, gradient border, gentle float, and hover scale. */
export function HeroProfileImage({ src, shouldReduceMotion }: HeroProfileImageProps) {
  return (
    <motion.div className="relative z-10" {...profileFloat(shouldReduceMotion)}>
      <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(168,85,247,0.14),transparent_70%)] blur-xl" />
      <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-cyan-400/60 via-purple-500/40 to-emerald-400/50" />
      <motion.div
        {...profileHover}
        className="relative h-52 w-52 overflow-hidden rounded-full bg-surface shadow-[0_0_60px_rgba(34,211,238,0.15),0_20px_60px_rgba(0,0,0,0.4)]"
      >
        <Image src={src} alt="Portrait of Akshay Tiwari" fill sizes="208px" priority className="object-cover" />
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.12),transparent_50%)]" />
      </motion.div>
    </motion.div>
  )
}
