'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { getSiteSettingsForAdmin, resolveSiteOgImageWrite } from '../data'
import { updateSiteSettingsSchema } from '../schemas/site-settings.schema'

export async function updateSiteSettings(input: unknown): Promise<MutationResult<Awaited<ReturnType<typeof getSiteSettingsForAdmin>>>> {
  await assertAdminAccess()

  return runMutation(updateSiteSettingsSchema, input, async (data) => {
    const existing = await getSiteSettingsForAdmin()
    const imageWrite = await resolveSiteOgImageWrite({ ogImage: data.ogImage, ogImageMediaId: data.ogImageMediaId })

    const settings = await prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        siteTitle: data.siteTitle,
        siteDescription: data.siteDescription,
        keywords: data.keywords,
        ...(imageWrite.ogImage !== undefined ? { ogImage: imageWrite.ogImage } : {}),
        ...(imageWrite.ogImageMediaId !== undefined ? { ogImageMediaId: imageWrite.ogImageMediaId } : {}),
        favicon: data.favicon,
        github: data.github,
        linkedin: data.linkedin,
        githubDisplay: data.githubDisplay,
        linkedinDisplay: data.linkedinDisplay,
        maintenanceMode: data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage ?? null,
      },
    })

    await recordAuditEvent({ action: 'update', entity: 'SiteSettings', entityId: settings.id })
    return settings
  }, 'update-site-settings')
}
