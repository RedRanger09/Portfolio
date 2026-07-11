import { cache } from 'react'
import { SITE } from '@/config/site.config'
import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { HeroCta, HeroData, InterestCard } from './types'

/**
 * Static fallback — also the source `prisma/seed.ts` seeds the `Hero` table
 * from. Served directly today; once migrated, served only if the database
 * is unreachable or unseeded (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_HERO_DATA: HeroData = {
  eyebrow: 'Computer Science · AI/ML',
  title: 'Akshay Tiwari',
  subtitle: 'Computer Science Student | AI/ML',
  description:
    "I'm a B.Tech Computer Science student who enjoys building AI projects in my free time. I learn best by shipping small, real things — from web apps to ML experiments — and improving them one iteration at a time.",
  profileImage: '/images/profile.jpg',
  showInterestCards: true,
  interestCards: [
    {
      icon: 'GraduationCap',
      label: 'Currently',
      title: 'B.Tech Computer Science',
      subtitle: 'SRMCEM · 2024–Present',
      items: [],
      accent: 'purple',
    },
    {
      icon: 'Code2',
      label: 'Building',
      title: 'Active projects',
      subtitle: 'Shipping real things',
      items: ['Lumora', 'Computer Vision', 'Portfolio'],
      accent: 'cyan',
    },
    {
      icon: 'Brain',
      label: 'Learning',
      title: 'AI / ML deep dives',
      subtitle: 'Current focus areas',
      items: ['Deep Learning', 'RAG', 'Agentic AI'],
      accent: 'emerald',
    },
  ],
  ctas: [
    { label: 'View Projects', href: '#projects', variant: 'primary', icon: 'FolderKanban' },
    { label: 'Download Resume', href: SITE.resumePath, variant: 'secondary', icon: 'Download', download: true },
    { label: 'GitHub', href: SITE.social.github, variant: 'ghost', icon: 'GitBranch' },
    { label: 'LinkedIn', href: SITE.social.linkedin, variant: 'ghost', icon: 'BriefcaseBusiness' },
  ],
}

/**
 * Returns hero section content. Reads the singleton `Hero` row from the
 * database — seeded by `prisma/seed.ts` to match `FALLBACK_HERO_DATA`
 * exactly — falling back to that same static content if the database is
 * unreachable or hasn't been seeded yet (`src/lib/db-fallback.ts`).
 *
 * Wrapped in React's `cache()` so multiple components reading Hero data in
 * the same request (e.g. a future SEO/OG image route reusing this) share
 * one query instead of issuing it twice.
 */
export const getHeroData = cache(async (): Promise<HeroData> => {
  return withDbFallback(
    async () => {
      const row = await prisma.hero.findFirst()
      if (!row) return null

      return {
        eyebrow: row.eyebrow,
        title: row.title,
        subtitle: row.subtitle,
        description: row.description,
        profileImage: row.profileImage,
        // Trusted, self-seeded JSON — not user input — so a direct cast is
        // safe; see `prisma/seed.ts` for the shape this is written with.
        interestCards: row.interestCards as unknown as InterestCard[],
        ctas: row.ctas as unknown as HeroCta[],
        showInterestCards: row.showInterestCards,
      }
    },
    FALLBACK_HERO_DATA,
    'hero',
  )
})
