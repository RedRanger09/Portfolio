import { SITE } from '@/config/site.config'
import { prisma } from '@/lib/prisma'
import { MutationValidationError } from '@/lib/mutation-result'
import { resolveMediaUrlById } from '@/features/media/lib/media-service'

export interface PublicSiteSettings {
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
  }
}

export async function getSiteSettingsForAdmin() {
  const existing = await prisma.siteSettings.findFirst()
  if (existing) return existing

  return prisma.siteSettings.create({ data: fallbackFromSiteConfig() })
}

export async function getSiteSettingsForPublic(): Promise<PublicSiteSettings> {
  const row = await prisma.siteSettings.findFirst()
  return row ?? fallbackFromSiteConfig()
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
