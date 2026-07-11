import type { EducationType } from '@/features/portfolio/education/types'

export interface AdminEducationListItem {
  id: string
  institution: string
  type: EducationType
  period: string
  degree: string
  isVisible: boolean
  order: number
  updatedAt: string
}

export interface EducationEditorValues {
  type: EducationType
  institution: string
  shortName: string
  degree: string
  period: string
  location: string
  description: string
  highlights: string[]
  expectedGraduation: string
  currentSemester: string
  order: number
}

export const EMPTY_EDUCATION_EDITOR_VALUES: EducationEditorValues = {
  type: 'college',
  institution: '',
  shortName: '',
  degree: '',
  period: '',
  location: '',
  description: '',
  highlights: [],
  expectedGraduation: '',
  currentSemester: '',
  order: 0,
}

export function mapEducationRowToEditorValues(row: {
  type: EducationType
  institution: string
  shortName: string
  degree: string
  period: string
  location: string
  description: string
  highlights: string[]
  expectedGraduation: string
  currentSemester: string
  order: number
}): EducationEditorValues {
  return {
    type: row.type,
    institution: row.institution,
    shortName: row.shortName,
    degree: row.degree,
    period: row.period,
    location: row.location,
    description: row.description,
    highlights: row.highlights,
    expectedGraduation: row.expectedGraduation,
    currentSemester: row.currentSemester,
    order: row.order,
  }
}

export function mapEditorValuesToCreateEducationInput(values: EducationEditorValues) {
  return {
    type: values.type,
    institution: values.institution,
    shortName: values.shortName || undefined,
    degree: values.degree,
    period: values.period,
    location: values.location,
    description: values.description,
    highlights: values.highlights,
    expectedGraduation: values.expectedGraduation || undefined,
    currentSemester: values.currentSemester || undefined,
    order: values.order,
  }
}

export function mapEditorValuesToUpdateEducationInput(id: string, values: EducationEditorValues) {
  return { id, ...mapEditorValuesToCreateEducationInput(values) }
}
