'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { updateResume } from '@/features/portfolio/resume/actions'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import { AdminCard, AdminField, AdminTextInput, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { ResumeEditorValues } from '../types'

interface Props {
  initialValues: ResumeEditorValues
  cloudinaryConfigured: boolean
}

export function ResumeEditor({ initialValues, cloudinaryConfigured }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const result = await updateResume(values)
          if (applyFieldErrors(result, setFieldErrors)) return
          if (!result.success) {
            setFormError(result.error.message)
            return
          }
          router.refresh()
        })
      }}
      className="space-y-6"
    >
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}

      <AdminCard as="section" aria-label="Visibility">
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={values.isVisible}
            onChange={(e) => setValues((c) => ({ ...c, isVisible: e.target.checked }))}
            className="h-4 w-4 rounded border-white/20 bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
          Show resume on the public website
        </label>
        <p className="mt-2 text-xs text-zinc-500">When unchecked, the Resume section stays in CMS but is hidden publicly.</p>
      </AdminCard>

      <AdminCard>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Label" name="label" error={fieldErrors.label}>
            <AdminTextInput value={values.label} onChange={(e) => setValues((c) => ({ ...c, label: e.target.value }))} required />
          </AdminField>
          <AdminField label="Title" name="title" error={fieldErrors.title}>
            <AdminTextInput value={values.title} onChange={(e) => setValues((c) => ({ ...c, title: e.target.value }))} required />
          </AdminField>
          <AdminField label="Resume PDF path" name="filePath" error={fieldErrors.filePath} hint="Public path to the PDF file.">
            <AdminTextInput value={values.filePath} onChange={(e) => setValues((c) => ({ ...c, filePath: e.target.value }))} required />
          </AdminField>
          <AdminField label="Preview alt text" name="previewAlt" error={fieldErrors.previewAlt}>
            <AdminTextInput value={values.previewAlt} onChange={(e) => setValues((c) => ({ ...c, previewAlt: e.target.value }))} required />
          </AdminField>
          <AdminField label="Preview width" name="previewImageWidth" error={fieldErrors.previewImageWidth}>
            <AdminTextInput
              type="number"
              min={1}
              value={values.previewImageWidth}
              onChange={(e) => setValues((c) => ({ ...c, previewImageWidth: Number(e.target.value) || 1 }))}
              required
            />
          </AdminField>
          <AdminField label="Preview height" name="previewImageHeight" error={fieldErrors.previewImageHeight}>
            <AdminTextInput
              type="number"
              min={1}
              value={values.previewImageHeight}
              onChange={(e) => setValues((c) => ({ ...c, previewImageHeight: Number(e.target.value) || 1 }))}
              required
            />
          </AdminField>
          <div className="md:col-span-2">
            <MediaUploadField
              label="Preview image"
              name="previewImage"
              folder="resume"
              value={{ mediaId: null, url: values.previewImage }}
              onChange={(m) => setValues((c) => ({ ...c, previewImage: m.url }))}
              cloudinaryConfigured={cloudinaryConfigured}
              fallbackPreviewUrl={values.previewImage}
            />
          </div>
        </div>
      </AdminCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href="/#resume" target="_blank" className="text-sm text-zinc-400 hover:text-white">
          Preview on site
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60',
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}
          Save resume
        </button>
      </div>
    </form>
  )
}
