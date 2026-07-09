'use client'

import { motion } from 'framer-motion'
import { getSimpleIconUrl } from '@/constants/tech-logos'
import { skillLogoHover } from '../animations/variants'

interface SkillLogoProps {
  logo: string
  name: string
}

/** One skill's brand logo + name, with a small hover lift. */
export function SkillLogo({ logo, name }: SkillLogoProps) {
  return (
    <motion.div {...skillLogoHover} className="group flex flex-col items-center gap-1.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-background/60 transition group-hover:border-white/20">
        {/*
          eslint-disable-next-line @next/next/no-img-element --
          Remote SVG from the Simple Icons CDN (see hero-tech-orbits.tsx for
          the documented dangerouslyAllowSVG/CSP trade-off).
        */}
        <img
          src={getSimpleIconUrl(logo)}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <span className="text-[0.6rem] text-zinc-600 transition group-hover:text-zinc-400">{name}</span>
    </motion.div>
  )
}
