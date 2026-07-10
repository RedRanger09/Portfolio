'use server'

import type { ContactInformation, SocialLink, SocialLinkIcon as PrismaSocialLinkIcon } from '@prisma/client'
import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import type { ContactMethodIcon } from '../types'
import { updateContactInformationSchema } from '../schemas/contact.schema'

/** Inverse of the `SOCIAL_LINK_ICON_MAP` read in `contact/data.ts` — only this action writes `SocialLink.icon`. */
const SOCIAL_LINK_ICON_TO_DB: Record<ContactMethodIcon, PrismaSocialLinkIcon> = {
  github: 'GITHUB',
  linkedin: 'LINKEDIN',
  email: 'EMAIL',
  location: 'LOCATION',
}

type ContactInformationWithLinks = ContactInformation & { socialLinks: SocialLink[] }

/**
 * Replaces the singleton `ContactInformation` row and its entire ordered
 * set of `SocialLink` children in one transaction — `methods` is
 * "the new full set," not a partial patch, so the old links are deleted
 * and the new ones created together with the parent row update. Multiple
 * writes that must succeed together is exactly the case
 * `docs/infrastructure/phase-5-4-implementation-notes.md`'s transaction
 * rule calls for; see `update-hero.ts`/`update-about.ts` for the
 * single-table siblings that don't need one.
 */
export async function updateContactInformation(input: unknown): Promise<MutationResult<ContactInformationWithLinks>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    updateContactInformationSchema,
    input,
    async (data) => {
      const contactInformation = await prisma.$transaction(async (tx) => {
        const existing = await tx.contactInformation.findFirst({ select: { id: true } })

        const contactInformationData = {
          label: data.label,
          title: data.title,
          description: data.description,
          sayHelloLabel: data.sayHelloLabel,
          sayHelloHref: data.sayHelloHref,
        }

        const record = existing
          ? await tx.contactInformation.update({ where: { id: existing.id }, data: contactInformationData })
          : await tx.contactInformation.create({ data: contactInformationData })

        await tx.socialLink.deleteMany({ where: { contactInformationId: record.id } })

        const socialLinks = await Promise.all(
          data.methods.map((method, index) =>
            tx.socialLink.create({
              data: {
                contactInformationId: record.id,
                label: method.label,
                value: method.value,
                href: method.href,
                icon: SOCIAL_LINK_ICON_TO_DB[method.icon],
                order: index,
              },
            }),
          ),
        )

        // TODO(audit): once the audit system exists, this call starts writing real rows.
        await recordAuditEvent({
          action: existing ? 'update' : 'create',
          entity: 'ContactInformation',
          entityId: record.id,
        })

        return { ...record, socialLinks }
      })

      return contactInformation
    },
    'update-contact-information',
  )
}
