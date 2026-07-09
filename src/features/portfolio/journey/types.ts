import type { AccentColor } from '@/shared/types'

/** Icon keys rendered by each milestone — see `journey/constants/icons.ts`. */
export type JourneyIcon =
  | 'GraduationCap'
  | 'Brain'
  | 'Workflow'
  | 'Building2'
  | 'Globe'
  | 'Zap'
  | 'Image'
  | 'Target'
  | 'Sparkles'
  | 'Award'
  | 'Code2'
  | 'TerminalSquare'

export interface JourneyStep {
  id: string
  label: string
  year: string
  description: string
  icon: JourneyIcon
  accent: AccentColor
  subItems?: string[]
  isCurrent?: boolean
}

export interface JourneySectionContent {
  label: string
  title: string
  subtitle: string
}
