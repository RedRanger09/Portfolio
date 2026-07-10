import type { SiteSettings } from '@prisma/client'

export interface SettingsEditorValues {
  siteTitle: string
  siteDescription: string
  keywords: string[]
  ogImage: string
  ogImageMediaId: string | null
  favicon: string
  github: string
  linkedin: string
  githubDisplay: string
  linkedinDisplay: string
  maintenanceMode: boolean
  maintenanceMessage: string
}

export function mapSettingsRowToEditorValues(row: SiteSettings): SettingsEditorValues {
  return {
    siteTitle: row.siteTitle,
    siteDescription: row.siteDescription,
    keywords: row.keywords,
    ogImage: row.ogImage,
    ogImageMediaId: row.ogImageMediaId,
    favicon: row.favicon,
    github: row.github,
    linkedin: row.linkedin,
    githubDisplay: row.githubDisplay,
    linkedinDisplay: row.linkedinDisplay,
    maintenanceMode: row.maintenanceMode,
    maintenanceMessage: row.maintenanceMessage ?? '',
  }
}
