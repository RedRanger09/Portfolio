import type { SiteSettings } from '@prisma/client'
import { DEFAULT_PUBLIC_VISIBILITY } from '@/features/settings/visibility-config'

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
  showHero: boolean
  showAbout: boolean
  showJourney: boolean
  showSkills: boolean
  showProjects: boolean
  showEducation: boolean
  showCertificates: boolean
  showResume: boolean
  showBlog: boolean
  showContact: boolean
  showContactForm: boolean
  showInterests: boolean
}

export type SettingsTabId = 'general' | 'seo' | 'social' | 'analytics' | 'visibility'

export const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'seo', label: 'SEO' },
  { id: 'social', label: 'Social' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'visibility', label: 'Visibility' },
]

export const SECTION_VISIBILITY_FIELDS: {
  key: keyof Pick<
    SettingsEditorValues,
    | 'showHero'
    | 'showAbout'
    | 'showJourney'
    | 'showSkills'
    | 'showProjects'
    | 'showEducation'
    | 'showCertificates'
    | 'showResume'
    | 'showBlog'
    | 'showContact'
    | 'showContactForm'
    | 'showInterests'
  >
  label: string
  hint?: string
}[] = [
  { key: 'showHero', label: 'Hero' },
  { key: 'showAbout', label: 'About' },
  { key: 'showJourney', label: 'Journey' },
  { key: 'showSkills', label: 'Skills' },
  { key: 'showProjects', label: 'Projects' },
  { key: 'showEducation', label: 'Education' },
  { key: 'showCertificates', label: 'Certificates' },
  { key: 'showResume', label: 'Resume' },
  { key: 'showBlog', label: 'Blog' },
  { key: 'showContact', label: 'Contact' },
  { key: 'showContactForm', label: 'Contact message form', hint: 'Shown inside the Contact section when Contact is enabled.' },
  { key: 'showInterests', label: 'Interests', hint: 'Interest cards inside the Hero section.' },
]

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
    showHero: row.showHero ?? DEFAULT_PUBLIC_VISIBILITY.showHero,
    showAbout: row.showAbout ?? DEFAULT_PUBLIC_VISIBILITY.showAbout,
    showJourney: row.showJourney ?? DEFAULT_PUBLIC_VISIBILITY.showJourney,
    showSkills: row.showSkills ?? DEFAULT_PUBLIC_VISIBILITY.showSkills,
    showProjects: row.showProjects ?? DEFAULT_PUBLIC_VISIBILITY.showProjects,
    showEducation: row.showEducation ?? DEFAULT_PUBLIC_VISIBILITY.showEducation,
    showCertificates: row.showCertificates ?? DEFAULT_PUBLIC_VISIBILITY.showCertificates,
    showResume: row.showResume ?? DEFAULT_PUBLIC_VISIBILITY.showResume,
    showBlog: row.showBlog ?? DEFAULT_PUBLIC_VISIBILITY.showBlog,
    showContact: row.showContact ?? DEFAULT_PUBLIC_VISIBILITY.showContact,
    showContactForm: row.showContactForm ?? DEFAULT_PUBLIC_VISIBILITY.showContactForm,
    showInterests: row.showInterests ?? DEFAULT_PUBLIC_VISIBILITY.showInterests,
  }
}
