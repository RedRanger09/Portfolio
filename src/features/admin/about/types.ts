import type { AboutData } from '@/features/portfolio/about/types'
import { FALLBACK_ABOUT_DATA } from '@/features/portfolio/about/data'

export type AboutEditorValues = AboutData

export function getDefaultAboutEditorValues(): AboutEditorValues {
  return structuredClone(FALLBACK_ABOUT_DATA)
}

export function mapAboutRowToEditorValues(row: AboutData): AboutEditorValues {
  return structuredClone(row)
}

export function mapEditorValuesToUpdateAboutInput(values: AboutEditorValues) {
  return { ...values }
}
