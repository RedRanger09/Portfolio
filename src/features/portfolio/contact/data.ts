import type { SocialLinkIcon as PrismaSocialLinkIcon } from '@prisma/client'
import { SITE } from '@/config/site.config'
import { withDbFallback } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { ContactInfo, ContactMethodIcon } from './types'

const emailHref = 'mailto:' + SITE.email

/**
 * Static fallback — also the source `prisma/seed.ts` seeds
 * `ContactInformation`/`SocialLink` from. Served directly today; once
 * migrated, served only if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export const FALLBACK_CONTACT_INFO: ContactInfo = {
  label: 'Contact',
  title: 'Get in touch',
  description: 'Open to internships, research collaborations, and project feedback. Happy to chat about AI, CS, or anything you are building.',
  methods: [
    { label: 'GitHub', value: SITE.social.githubDisplay, href: SITE.social.github, icon: 'github' },
    { label: 'LinkedIn', value: SITE.social.linkedinDisplay, href: SITE.social.linkedin, icon: 'linkedin' },
    { label: 'Email', value: SITE.email, href: emailHref, icon: 'email' },
    { label: 'Location', value: SITE.location, href: '#', icon: 'location' },
  ],
  sayHelloLabel: 'Say hello',
  sayHelloHref: emailHref,
}

/** Mirrors `SocialLinkIcon` in `prisma/schema.prisma` — only this feature reads it, so the mapper stays local. */
const SOCIAL_LINK_ICON_MAP: Record<PrismaSocialLinkIcon, ContactMethodIcon> = {
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  LOCATION: 'location',
}

/**
 * Returns Contact section content, including its ordered social/contact
 * channels. Reads the singleton `ContactInformation` row (with its
 * `SocialLink` children) from the database, falling back to
 * `FALLBACK_CONTACT_INFO` if the database is unreachable or unseeded
 * (`src/lib/db-fallback.ts`).
 */
export async function getContactInfo(): Promise<ContactInfo> {
  return withDbFallback(
    async () => {
      const row = await prisma.contactInformation.findFirst({
        include: { socialLinks: { orderBy: { order: 'asc' } } },
      })
      if (!row) return null

      return {
        label: row.label,
        title: row.title,
        description: row.description,
        methods: row.socialLinks.map((link) => ({
          label: link.label,
          value: link.value,
          href: link.href,
          icon: SOCIAL_LINK_ICON_MAP[link.icon],
        })),
        sayHelloLabel: row.sayHelloLabel,
        sayHelloHref: row.sayHelloHref,
      }
    },
    FALLBACK_CONTACT_INFO,
    'contact',
  )
}
