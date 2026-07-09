import type { AccentColor } from '@/shared/types'

export interface SkillItem {
  name: string
  logo: string
}

export interface SkillGroup {
  title: string
  icon: string
  accent: AccentColor
  items: SkillItem[]
  note: string
}
