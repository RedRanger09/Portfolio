import type { AccentColor } from '@/shared/types'
import type { JourneyIcon } from '@/features/portfolio/journey/types'

export interface AdminJourneyListItem {
  id: string
  label: string
  year: string
  icon: JourneyIcon
  accent: AccentColor
  isCurrent: boolean
  isVisible: boolean
  order: number
  updatedAt: string
}

export interface JourneyEditorValues {
  label: string
  year: string
  description: string
  icon: JourneyIcon
  accent: AccentColor
  isCurrent: boolean
  subItems: string[]
  order: number
}

export const EMPTY_JOURNEY_EDITOR_VALUES: JourneyEditorValues = {
  label: '',
  year: '',
  description: '',
  icon: 'GraduationCap',
  accent: 'purple',
  isCurrent: false,
  subItems: [],
  order: 0,
}

export function mapJourneyRowToEditorValues(row: {
  label: string
  year: string
  description: string
  icon: JourneyIcon
  accent: AccentColor
  isCurrent: boolean
  subItems: string[]
  order: number
}): JourneyEditorValues {
  return {
    label: row.label,
    year: row.year,
    description: row.description,
    icon: row.icon,
    accent: row.accent,
    isCurrent: row.isCurrent,
    subItems: row.subItems,
    order: row.order,
  }
}

export function mapEditorValuesToCreateJourneyInput(values: JourneyEditorValues) {
  return {
    label: values.label,
    year: values.year,
    description: values.description,
    icon: values.icon,
    accent: values.accent,
    isCurrent: values.isCurrent,
    subItems: values.subItems,
    order: values.order,
  }
}

export function mapEditorValuesToUpdateJourneyInput(id: string, values: JourneyEditorValues) {
  return { id, ...mapEditorValuesToCreateJourneyInput(values) }
}
