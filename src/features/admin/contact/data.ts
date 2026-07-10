import type { SocialLinkIcon as PrismaSocialLinkIcon } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { ContactMethodIcon } from '@/features/portfolio/contact/types'

const ICON_MAP: Record<PrismaSocialLinkIcon, ContactMethodIcon> = {
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  LOCATION: 'location',
}

export async function getContactForAdmin() {
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
      icon: ICON_MAP[link.icon],
    })),
    sayHelloLabel: row.sayHelloLabel,
    sayHelloHref: row.sayHelloHref,
  }
}
