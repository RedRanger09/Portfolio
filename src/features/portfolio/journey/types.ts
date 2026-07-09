import type { AccentColor } from '@/shared/types'

export interface JourneyStep {
  id: string
  label: string
  year: string
  description: string
  icon: string
  accent: AccentColor
  subItems?: string[]
  isCurrent?: boolean
}
