'use client'

import { motion } from 'framer-motion'
import { heroContentReveal } from '../animations/variants'
import { HeroBadge } from './hero-badge'
import { HeroHeadline } from './hero-headline'
import { HeroDescription } from './hero-description'
import { HeroCtaGroup } from './hero-cta'
import { HeroInterestCards } from './hero-interest-cards'
import type { HeroData } from '../types'

interface HeroContentProps {
  data: HeroData
}

/**
 * Left column. Everything inside shares one fade-up entrance (matching the
 * legacy design, which never staggered the badge/headline/description/CTA
 * individually) — only the interest cards below get their own stagger.
 */
export function HeroContent({ data }: HeroContentProps) {
  return (
    <motion.div {...heroContentReveal}>
      <HeroBadge eyebrow={data.eyebrow} />
      <HeroHeadline title={data.title} subtitle={data.subtitle} />
      <HeroDescription description={data.description} />
      <HeroCtaGroup ctas={data.ctas} />
      {data.showInterestCards && data.interestCards.length > 0 ? <HeroInterestCards cards={data.interestCards} /> : null}
    </motion.div>
  )
}
