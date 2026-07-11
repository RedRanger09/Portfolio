'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateSiteSettings } from '@/features/settings/actions'
import { applyFieldErrors, AdminCard, AdminField, AdminTextInput, AdminTextarea, StringListField } from '@/features/admin/shared'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import type { MediaFieldValue } from '@/features/media/types'
import { cn } from '@/shared/utils'
import {
  SECTION_VISIBILITY_FIELDS,
  SETTINGS_TABS,
  type SettingsEditorValues,
  type SettingsTabId,
} from '../types'

interface SettingsEditorProps {
  initialValues: SettingsEditorValues
  cloudinaryConfigured: boolean
  analyticsMeasurementId: string | null
}

export function SettingsEditor({
  initialValues,
  cloudinaryConfigured,
  analyticsMeasurementId,
}: SettingsEditorProps) {
  const [values, setValues] = useState(initialValues)
  const [tab, setTab] = useState<SettingsTabId>('general')
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
      if (!result.success) {
        setFormError(result.error.message)
        return
      }
      setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">
          {formError}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300" role="status">
          Settings saved.
        </div>
      )}

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-surface/50 p-1"
      >
        {SETTINGS_TABS.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`settings-tab-${item.id}`}
              aria-controls={`settings-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                selected ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-zinc-200',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
        className="space-y-6"
      >
        {tab === 'general' ? (
          <>
            <AdminCard as="section" aria-label="Site identity">
              <div className="grid gap-5">
                <AdminField label="Site title" name="siteTitle" error={fieldErrors.siteTitle}>
                  <AdminTextInput id="siteTitle" value={values.siteTitle} onChange={(e) => updateValue('siteTitle', e.target.value)} required />
                </AdminField>
                <AdminField label="Site description" name="siteDescription" error={fieldErrors.siteDescription}>
                  <AdminTextarea id="siteDescription" rows={3} value={values.siteDescription} onChange={(e) => updateValue('siteDescription', e.target.value)} required />
                </AdminField>
                <StringListField
                  label="Keywords"
                  name="keywords"
                  values={values.keywords}
                  onChange={(keywords) => updateValue('keywords', keywords.filter(Boolean))}
                  placeholder="Add keyword"
                />
              </div>
            </AdminCard>

            <AdminCard as="section" aria-label="Maintenance mode">
              <div className="grid gap-5">
                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={values.maintenanceMode}
                    onChange={(e) => updateValue('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-background"
                  />
                  Enable maintenance mode (prepared — not enforced on public routes yet)
                </label>
                <AdminField label="Maintenance message" name="maintenanceMessage" error={fieldErrors.maintenanceMessage}>
                  <AdminTextarea
                    id="maintenanceMessage"
                    rows={2}
                    value={values.maintenanceMessage}
                    onChange={(e) => updateValue('maintenanceMessage', e.target.value)}
                  />
                </AdminField>
              </div>
            </AdminCard>
          </>
        ) : null}

        {tab === 'seo' ? (
          <AdminCard as="section" aria-label="SEO and assets">
            <div className="grid gap-5">
              <MediaUploadField
                name="ogImage"
                label="Open Graph image"
                folder="about"
                value={{ mediaId: values.ogImageMediaId, url: values.ogImage }}
                onChange={handleOgImageChange}
                cloudinaryConfigured={cloudinaryConfigured}
                error={fieldErrors.ogImage ?? fieldErrors.ogImageMediaId}
              />
              <AdminField
                label="Favicon path"
                name="favicon"
                error={fieldErrors.favicon}
                hint="Path under /public, e.g. /icons/favicon.svg"
              >
                <AdminTextInput id="favicon" value={values.favicon} onChange={(e) => updateValue('favicon', e.target.value)} required />
              </AdminField>
            </div>
          </AdminCard>
        ) : null}

        {tab === 'social' ? (
          <AdminCard as="section" aria-label="Social links">
            <div className="grid gap-5 md:grid-cols-2">
              <AdminField label="GitHub URL" name="github" error={fieldErrors.github}>
                <AdminTextInput id="github" value={values.github} onChange={(e) => updateValue('github', e.target.value)} required />
              </AdminField>
              <AdminField label="LinkedIn URL" name="linkedin" error={fieldErrors.linkedin}>
                <AdminTextInput id="linkedin" value={values.linkedin} onChange={(e) => updateValue('linkedin', e.target.value)} required />
              </AdminField>
              <AdminField label="GitHub display" name="githubDisplay" error={fieldErrors.githubDisplay}>
                <AdminTextInput id="githubDisplay" value={values.githubDisplay} onChange={(e) => updateValue('githubDisplay', e.target.value)} required />
              </AdminField>
              <AdminField label="LinkedIn display" name="linkedinDisplay" error={fieldErrors.linkedinDisplay}>
                <AdminTextInput id="linkedinDisplay" value={values.linkedinDisplay} onChange={(e) => updateValue('linkedinDisplay', e.target.value)} required />
              </AdminField>
            </div>
          </AdminCard>
        ) : null}

        {tab === 'analytics' ? (
          <AdminCard as="section" aria-label="Analytics">
            <p className="text-sm text-zinc-400">
              Public tracking uses the server env var <code className="text-zinc-300">GOOGLE_ANALYTICS_ID</code>.
              Change it in Vercel / <code className="text-zinc-300">.env.local</code>, then redeploy.
            </p>
            <p className="mt-4 text-sm text-zinc-300">
              Current measurement ID:{' '}
              <span className="font-medium text-white">{analyticsMeasurementId ?? 'Not configured'}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Detailed reporting lives under Admin → Analytics (GA4 Data API credentials).
            </p>
          </AdminCard>
        ) : null}

        {tab === 'visibility' ? (
          <AdminCard as="section" aria-label="Website sections">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Website Sections</h2>
              <p className="text-sm text-zinc-400">
                Hide sections from the public portfolio without deleting CMS content. Changes apply after save.
              </p>
            </div>
            <ul className="mt-5 divide-y divide-white/[0.06]">
              {SECTION_VISIBILITY_FIELDS.map((field) => (
                <li key={field.key} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <label htmlFor={`visibility-${field.key}`} className="text-sm font-medium text-zinc-200">
                      {field.label}
                    </label>
                    {field.hint ? <p className="mt-0.5 text-xs text-zinc-500">{field.hint}</p> : null}
                  </div>
                  <input
                    id={`visibility-${field.key}`}
                    type="checkbox"
                    checked={values[field.key]}
                    onChange={(e) => updateValue(field.key, e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </li>
              ))}
            </ul>
          </AdminCard>
        ) : null}
      </div>

      {tab !== 'analytics' ? (
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </button>
      ) : null}
    </form>
  )
}
