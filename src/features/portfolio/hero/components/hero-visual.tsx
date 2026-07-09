'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useHeroCursorParallax } from '../hooks/use-hero-cursor-parallax'
import { heroVisualReveal } from '../animations/variants'
import { HeroTechOrbits } from './hero-tech-orbits'
import { HeroProfileImage } from './hero-profile-image'

interface HeroVisualProps {
  profileImage: string
}

/**
 * Right column: the profile photo plus its floating tech-orb backdrop.
 * Owns the mouse-tracked parallax — the orbs drift opposite the cursor as it
 * moves within this container.
 */
export function HeroVisual({ profileImage }: HeroVisualProps) {
  const shouldReduceMotion = useReducedMotion() ?? false
  const { containerRef, mouseX, mouseY, onMouseMove, onMouseLeave } = useHeroCursorParallax(shouldReduceMotion)

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...heroVisualReveal}
      className="relative flex items-center justify-center"
      style={{ minHeight: 340 }}
    >
      <HeroTechOrbits shouldReduceMotion={shouldReduceMotion} mouseX={mouseX} mouseY={mouseY} />
      <HeroProfileImage src={profileImage} shouldReduceMotion={shouldReduceMotion} />
    </motion.div>
  )
}
