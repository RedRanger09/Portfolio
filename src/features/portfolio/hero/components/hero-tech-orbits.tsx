'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { getSimpleIconUrl } from '@/constants/tech-logos'
import { TECH_ORBS, type TechOrbConfig } from '../constants/tech-orbits'
import { techOrbPulse } from '../animations/variants'

interface HeroTechOrbitsProps {
  shouldReduceMotion: boolean
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}

/**
 * Floating, cursor-reactive technology logos behind the profile photo.
 * Purely decorative — `aria-hidden` on the wrapper so screen readers skip
 * straight past it to the profile photo (the tech stack is already listed
 * properly in the Skills section).
 *
 * Hidden entirely under reduced motion, matching the legacy behavior of not
 * rendering orbs at all rather than showing them static.
 */
export function HeroTechOrbits({ shouldReduceMotion, mouseX, mouseY }: HeroTechOrbitsProps) {
  if (shouldReduceMotion) return null

  return (
    <div aria-hidden="true">
      {TECH_ORBS.map((orb) => (
        <TechOrb key={orb.label} orb={orb} shouldReduceMotion={shouldReduceMotion} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  )
}

function TechOrb({
  orb,
  shouldReduceMotion,
  mouseX,
  mouseY,
}: {
  orb: TechOrbConfig
  shouldReduceMotion: boolean
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const factor = orb.parallax
  const px = useTransform(mouseX, [-0.5, 0.5], [-factor * 14, factor * 14])
  const py = useTransform(mouseY, [-0.5, 0.5], [-factor * 10, factor * 10])

  return (
    <motion.div className="absolute pointer-events-none" style={{ left: `${orb.x}%`, top: `${orb.y}%`, x: px, y: py }}>
      <motion.div
        {...techOrbPulse(orb.delay, shouldReduceMotion)}
        className="relative flex items-center justify-center"
        style={{ width: orb.size, height: orb.size }}
      >
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: '-60%',
            background: `radial-gradient(circle, rgba(${orb.glow}, 0.4) 0%, transparent 68%)`,
            filter: 'blur(3px)',
          }}
        />
        {/*
          eslint-disable-next-line @next/next/no-img-element --
          Remote SVGs from the Simple Icons CDN. next/image would need
          `images.dangerouslyAllowSVG` + a CSP added to next.config.ts
          app-wide — a disproportionate config change for 8 decorative
          icons that carry no meaningful optimization benefit as vectors.
        */}
        <img
          src={getSimpleIconUrl(orb.logo)}
          alt=""
          width={orb.size}
          height={orb.size}
          className="relative drop-shadow-lg"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </motion.div>
    </motion.div>
  )
}
