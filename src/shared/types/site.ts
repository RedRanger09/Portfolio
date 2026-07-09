export interface SiteSocial {
  github: string
  linkedin: string
  githubDisplay: string
  linkedinDisplay: string
}

export interface SiteConfig {
  name: string
  role: string
  email: string
  location: string
  resumePath: string
  resumePreview: string
  siteUrl: string
  title: string
  description: string
  keywords: string[]
  social: SiteSocial
}
