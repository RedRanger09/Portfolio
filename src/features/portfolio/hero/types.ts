import type { AccentColor } from '@/shared/types'

export interface InterestCard {
  icon: string
  label: string
  title: string
  subtitle: string
  items: string[]
  accent: AccentColor
}

export type CtaVariant = 'primary' | 'secondary' | 'ghost'

export interface HeroCta {
  label: string
  href: string
  variant: CtaVariant
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
