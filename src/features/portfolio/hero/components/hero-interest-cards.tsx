'use client'

import { motion } from 'framer-motion'
import { ACCENT_CLASSES } from '@/constants/theme'
import { HERO_INTEREST_ICONS } from '../constants/icons'
import { interestCardReveal } from '../animations/variants'
import type { InterestCard } from '../types'

interface HeroInterestCardsProps {
  cards: InterestCard[]
}

/** Bento-style "studying / building / learning" cards. Each stags in with its own delay + hover lift. */
export function HeroInterestCards({ cards }: HeroInterestCardsProps) {
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-3">
      {cards.map((card, index) => (
        <HeroInterestCard key={card.label} card={card} index={index} />
      ))}
    </div>
  )
}

function HeroInterestCard({ card, index }: { card: InterestCard; index: number }) {
  const accent = ACCENT_CLASSES[card.accent]
  const Icon = HERO_INTEREST_ICONS[card.icon]

  return (
    <motion.div
      {...interestCardReveal(index)}
      className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-white/[0.025] p-5 shadow-[0_4px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}
    >
      <span
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
        style={{ background: accent.glow }}
        aria-hidden="true"
      />

      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${accent.border} ${accent.bg}`}>
        <Icon className={`h-[18px] w-[18px] ${accent.text}`} aria-hidden="true" />
      </div>

      <p className={`font-mono text-[0.6rem] uppercase tracking-widest ${accent.text}`}>{card.label}</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-white">{card.title}</p>
      {card.subtitle && <p className="mt-0.5 text-xs text-zinc-500">{card.subtitle}</p>}

      {card.items.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {card.items.map((item) => (
            <li
              key={item}
              className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-medium ${accent.border} ${accent.text} bg-black/20`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
