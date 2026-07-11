import type { Metadata } from 'next'
import { env } from '@/config/env'
import { SectionTitle } from '@/features/admin/shared'
import { getSiteSettingsForAdmin, SettingsEditor, mapSettingsRowToEditorValues } from '@/features/admin/settings'
import { isCloudinaryConfigured } from '@/features/media/data'

export const metadata: Metadata = { title: 'Settings' }

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsForAdmin()
  const cloudinaryConfigured = isCloudinaryConfigured()

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Settings"
        description="Global portfolio settings — SEO, social links, analytics, and public section visibility."
      />
      <SettingsEditor
        initialValues={mapSettingsRowToEditorValues(settings)}
        cloudinaryConfigured={cloudinaryConfigured}
        analyticsMeasurementId={env.googleAnalyticsId ?? null}
      />
    </div>
  )
}
