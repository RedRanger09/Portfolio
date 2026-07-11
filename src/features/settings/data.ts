import { SITE } from '@/config/site.config'
import { prisma } from '@/lib/prisma'
import { MutationValidationError } from '@/lib/mutation-result'
import { resolveMediaUrlById } from '@/features/media/lib/media-service'
import { DEFAULT_PUBLIC_VISIBILITY, type PublicVisibility } from './visibility-config'

export interface PublicSiteSettings extends PublicVisibility {
  siteTitle: string
  siteDescription: string
  keywords: string[]
  ogImage: string
  favicon: string
  github: string
  linkedin: string
  githubDisplay: string
  linkedinDisplay: string
  maintenanceMode: boolean
  maintenanceMessage: string | null
}

function fallbackFromSiteConfig(): PublicSiteSettings {
  return {
    siteTitle: SITE.title,
    siteDescription: SITE.description,
    keywords: SITE.keywords,
    ogImage: '/images/profile.jpg',
    favicon: '/icons/favicon.svg',
    github: SITE.social.github,
    linkedin: SITE.social.linkedin,
    githubDisplay: SITE.social.githubDisplay,
    linkedinDisplay: SITE.social.linkedinDisplay,
    maintenanceMode: false,
    maintenanceMessage: null,
    ...DEFAULT_PUBLIC_VISIBILITY,
  }
}

export async function getSiteSettingsForAdmin() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) return existing

  return prisma.siteSettings.create({ data: fallbackFromSiteConfig() })
}

export async function getSiteSettingsForPublic(): Promise<PublicSiteSettings> {
  const row = await prisma.siteSettings.findFirst()
  if (!row) return fallbackFromSiteConfig()

  return {
    siteTitle: row.siteTitle,
    siteDescription: row.siteDescription,
    keywords: row.keywords,
    ogImage: row.ogImage,
    favicon: row.favicon,
    github: row.github,
    linkedin: row.linkedin,
    githubDisplay: row.githubDisplay,
    linkedinDisplay: row.linkedinDisplay,
    maintenanceMode: row.maintenanceMode,
    maintenanceMessage: row.maintenanceMessage,
    showHero: row.showHero,
    showAbout: row.showAbout,
    showJourney: row.showJourney,
    showSkills: row.showSkills,
    showProjects: row.showProjects,
    showEducation: row.showEducation,
    showCertificates: row.showCertificates,
    showResume: row.showResume,
    showBlog: row.showBlog,
    showContact: row.showContact,
    showContactForm: row.showContactForm,
    showInterests: row.showInterests,
  }
}

interface OgImageWriteInput {
  ogImage?: string
  ogImageMediaId?: string | null
}

export async function resolveSiteOgImageWrite(input: OgImageWriteInput) {
  if (input.ogImageMediaId === undefined) return { ogImage: input.ogImage }

  if (input.ogImageMediaId === null) {
    if (!input.ogImage) throw new MutationValidationError({ ogImage: ['Open Graph image is required.'] })
    return { ogImage: input.ogImage, ogImageMediaId: null }
  }

  const url = await resolveMediaUrlById(input.ogImageMediaId)
  if (!url) throw new MutationValidationError({ ogImageMediaId: ['Selected media no longer exists.'] })

  return { ogImage: url, ogImageMediaId: input.ogImageMediaId }
}
