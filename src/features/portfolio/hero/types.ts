import type { AccentColor } from '@/shared/types'

/** Icon keys rendered by the bento-style interest cards — see `hero/constants/icons.ts`. */
export type HeroInterestIcon = 'GraduationCap' | 'Code2' | 'Brain'

export interface InterestCard {
  icon: HeroInterestIcon
  label: string
  title: string
  subtitle: string
  items: string[]
  accent: AccentColor
}

export type CtaVariant = 'primary' | 'secondary' | 'ghost'

/** Icon keys rendered next to each CTA — see `hero/constants/icons.ts`. */
export type HeroCtaIcon = 'FolderKanban' | 'Download' | 'GitBranch' | 'BriefcaseBusiness'

export interface HeroCta {
  label: string
  href: string
  variant: CtaVariant
  icon: HeroCtaIcon
  download?: boolean
}

export interface HeroData {
  eyebrow: string
  title: string
  subtitle: string
  description: string
  profileImage: string
  interestCards: InterestCard[]
  ctas: HeroCta[]
}
