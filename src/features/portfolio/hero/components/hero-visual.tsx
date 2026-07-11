'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { heroVisualReveal } from '../animations/variants'
import { HeroEngineeringBackdrop } from './hero-engineering-backdrop'
import { HeroProfileImage } from './hero-profile-image'

interface HeroVisualProps {
  profileImage: string
}

/**
 * Right column: portrait centered in a field of AI/ML engineering diagrams.
 * Diagrams stay behind the photo and never cover the face.
 */
export function HeroVisual({ profileImage }: HeroVisualProps) {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <motion.div
      {...heroVisualReveal}
      className="relative mx-auto flex aspect-[5/6] w-full max-w-[36rem] items-center justify-center sm:max-w-[40rem] lg:ml-auto lg:mr-0 lg:max-w-[42rem]"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroEngineeringBackdrop />
      </div>

      <div className="relative z-10 flex items-center justify-center">
        <HeroProfileImage src={profileImage} shouldReduceMotion={shouldReduceMotion} />
      </div>
    </motion.div>
  )
}
