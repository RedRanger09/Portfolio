import type { ContactInfo } from '@/features/portfolio/contact/types'
import { FALLBACK_CONTACT_INFO } from '@/features/portfolio/contact/data'

export type ContactEditorValues = ContactInfo

export function getDefaultContactEditorValues(): ContactEditorValues {
  return structuredClone(FALLBACK_CONTACT_INFO)
}

export function mapContactRowToEditorValues(row: ContactInfo): ContactEditorValues {
  return structuredClone(row)
}

export function mapEditorValuesToUpdateContactInput(values: ContactEditorValues) {
  return { ...values }
}
