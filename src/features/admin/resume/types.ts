import type { ResumeData } from '@/features/portfolio/resume/types'
import { FALLBACK_RESUME_DATA } from '@/features/portfolio/resume/data'

export type ResumeEditorValues = ResumeData

export function getDefaultResumeEditorValues(): ResumeEditorValues {
  return structuredClone(FALLBACK_RESUME_DATA)
}

export function mapResumeRowToEditorValues(row: ResumeData): ResumeEditorValues {
  return structuredClone(row)
}

export function mapEditorValuesToUpdateResumeInput(values: ResumeEditorValues) {
  return { ...values }
}
