export interface AdminCertificationListItem {
  id: string
  name: string
  provider: string
  completionDate: string
  isVisible: boolean
  order: number
  updatedAt: string
  image: string
}

export interface CertificationEditorValues {
  name: string
  provider: string
  providerLogo: string
  completionDate: string
  credentialUrl: string
  verifyUrl: string
  image: string
  order: number
}

export const EMPTY_CERTIFICATION_EDITOR_VALUES: CertificationEditorValues = {
  name: '', provider: '', providerLogo: '', completionDate: '', credentialUrl: '', verifyUrl: '', image: '', order: 0,
}

export function mapCertificationRowToEditorValues(row: CertificationEditorValues): CertificationEditorValues {
  return { ...row }
}

export function mapEditorValuesToCreateCertificationInput(values: CertificationEditorValues) {
  return { ...values, providerLogo: values.providerLogo || undefined, completionDate: values.completionDate || undefined }
}

export function mapEditorValuesToUpdateCertificationInput(id: string, values: CertificationEditorValues) {
  return { id, ...mapEditorValuesToCreateCertificationInput(values) }
}
