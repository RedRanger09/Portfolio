export interface Certification {
  name: string
  provider: string
  providerLogo: string | null
  completionDate: string
  credentialUrl: string
  verifyUrl: string
  image: string
}

export interface CertificationsSectionContent {
  label: string
  title: string
  subtitle: string
}
