import { SITE } from '@/config/site.config'
import type { HeroData } from './types'

const heroData: HeroData = {
  eyebrow: 'Computer Science · AI/ML',
  title: 'Akshay Tiwari',
  subtitle: 'Computer Science Student | AI/ML',
  description:
    "I'm a B.Tech Computer Science student who enjoys building AI projects in my free time. I learn best by shipping small, real things — from web apps to ML experiments — and improving them one iteration at a time.",
  profileImage: '/images/profile.jpg',
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
 * Returns hero section content.
 * `async` on purpose — this is a future extension point for a CMS/DB-backed
 * implementation (Phase 3+) without changing any call site.
 */
export async function getHeroData(): Promise<HeroData> {
  return heroData
}
