'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateSiteSettings } from '@/features/settings/actions'
import { applyFieldErrors, AdminCard, AdminField, AdminTextInput, AdminTextarea, StringListField } from '@/features/admin/shared'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import type { MediaFieldValue } from '@/features/media/types'
import type { SettingsEditorValues } from '../types'

interface SettingsEditorProps {
  initialValues: SettingsEditorValues
  cloudinaryConfigured: boolean
}

export function SettingsEditor({ initialValues, cloudinaryConfigured }: SettingsEditorProps) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function updateValue<K extends keyof SettingsEditorValues>(key: K, value: SettingsEditorValues[K]) {
    setValues((c) => ({ ...c, [key]: value }))
    setSaved(false)
  }

  function handleOgImageChange(media: MediaFieldValue) {
    updateValue('ogImageMediaId', media.mediaId)
    updateValue('ogImage', media.url || values.ogImage)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setSaved(false)

    startTransition(async () => {
      const result = await updateSiteSettings({
        ...values,
        maintenanceMessage: values.maintenanceMessage || null,
      })

      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">{formError}</div>}
      {saved && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">Settings saved.</div>}

      <AdminCard as="section" aria-label="Site identity">
        <div className="grid gap-5">
          <AdminField label="Site title" name="siteTitle" error={fieldErrors.siteTitle}><AdminTextInput id="siteTitle" value={values.siteTitle} onChange={(e) => updateValue('siteTitle', e.target.value)} required /></AdminField>
          <AdminField label="Site description" name="siteDescription" error={fieldErrors.siteDescription}><AdminTextarea id="siteDescription" rows={3} value={values.siteDescription} onChange={(e) => updateValue('siteDescription', e.target.value)} required /></AdminField>
          <StringListField label="Keywords" name="keywords" values={values.keywords} onChange={(keywords) => updateValue('keywords', keywords.filter(Boolean))} placeholder="Add keyword" />
        </div>
      </AdminCard>

      <AdminCard as="section" aria-label="SEO and assets">
        <div className="grid gap-5">
          <MediaUploadField name="ogImage" label="Open Graph image" folder="about" value={{ mediaId: values.ogImageMediaId, url: values.ogImage }} onChange={handleOgImageChange} cloudinaryConfigured={cloudinaryConfigured} error={fieldErrors.ogImage ?? fieldErrors.ogImageMediaId} />
          <AdminField label="Favicon path" name="favicon" error={fieldErrors.favicon} hint="Path under /public, e.g. /icons/favicon.svg"><AdminTextInput id="favicon" value={values.favicon} onChange={(e) => updateValue('favicon', e.target.value)} required /></AdminField>
        </div>
      </AdminCard>

      <AdminCard as="section" aria-label="Social links">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="GitHub URL" name="github" error={fieldErrors.github}><AdminTextInput id="github" value={values.github} onChange={(e) => updateValue('github', e.target.value)} required /></AdminField>
          <AdminField label="LinkedIn URL" name="linkedin" error={fieldErrors.linkedin}><AdminTextInput id="linkedin" value={values.linkedin} onChange={(e) => updateValue('linkedin', e.target.value)} required /></AdminField>
          <AdminField label="GitHub display" name="githubDisplay" error={fieldErrors.githubDisplay}><AdminTextInput id="githubDisplay" value={values.githubDisplay} onChange={(e) => updateValue('githubDisplay', e.target.value)} required /></AdminField>
          <AdminField label="LinkedIn display" name="linkedinDisplay" error={fieldErrors.linkedinDisplay}><AdminTextInput id="linkedinDisplay" value={values.linkedinDisplay} onChange={(e) => updateValue('linkedinDisplay', e.target.value)} required /></AdminField>
        </div>
      </AdminCard>

      <AdminCard as="section" aria-label="Maintenance mode">
        <div className="grid gap-5">
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" checked={values.maintenanceMode} onChange={(e) => updateValue('maintenanceMode', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-background" />
            Enable maintenance mode (prepared — not enforced on public routes yet)
          </label>
          <AdminField label="Maintenance message" name="maintenanceMessage" error={fieldErrors.maintenanceMessage}>
            <AdminTextarea id="maintenanceMessage" rows={2} value={values.maintenanceMessage} onChange={(e) => updateValue('maintenanceMessage', e.target.value)} />
          </AdminField>
        </div>
      </AdminCard>

      <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white disabled:opacity-60">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save settings
      </button>
    </form>
  )
}
