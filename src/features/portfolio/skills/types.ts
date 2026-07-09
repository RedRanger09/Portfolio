import type { AccentColor } from '@/shared/types'

/** Icon keys rendered on each skill group's header — see `skills/constants/icons.ts`. */
export type SkillGroupIcon = 'Code2' | 'Brain' | 'Layout' | 'Wrench' | 'Cloud'

export interface SkillItem {
  name: string
  logo: string
}

export interface SkillGroup {
  title: string
  icon: SkillGroupIcon
  accent: AccentColor
  items: SkillItem[]
  note: string
}

export interface SkillsSectionContent {
  label: string
  title: string
  subtitle: string
}
