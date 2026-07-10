import type { HeroData } from '@/features/portfolio/hero/types'
import { FALLBACK_HERO_DATA } from '@/features/portfolio/hero/data'

export type HeroEditorValues = HeroData

export function getDefaultHeroEditorValues(): HeroEditorValues {
  return structuredClone(FALLBACK_HERO_DATA)
}

export function mapHeroRowToEditorValues(row: HeroData): HeroEditorValues {
  return structuredClone(row)
}

export function mapEditorValuesToUpdateHeroInput(values: HeroEditorValues) {
  return { ...values }
}

export type { InterestCard, HeroCta, HeroInterestIcon, HeroCtaIcon } from '@/features/portfolio/hero/types'
