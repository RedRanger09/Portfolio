'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { profileFloat, profileHover } from '../animations/variants'

interface HeroProfileImageProps {
  src: string
  shouldReduceMotion: boolean
}

/**
 * Circular portrait — quiet border, sized for balance against
 * the surrounding engineering diagrams.
 */
export function HeroProfileImage({ src, shouldReduceMotion }: HeroProfileImageProps) {
  return (
    <motion.div className="relative z-10" {...profileFloat(shouldReduceMotion)}>
      <div
        className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.2),rgba(34,211,238,0.1),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        {...profileHover}
        className="relative overflow-hidden rounded-full border border-white/[0.14] bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/10"
      >
        <div className="relative aspect-square w-[min(100%,14.75rem)] sm:w-[15.75rem]">
          <Image
            src={src}
            alt="Portrait of Akshay Tiwari"
            fill
            sizes="(max-width: 640px) 236px, 252px"
            priority
            className="object-cover object-[center_18%]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/[0.05]"
            aria-hidden="true"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
