'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createCertification, updateCertification } from '@/features/portfolio/certifications/actions'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import { AdminCard, AdminField, AdminTextInput, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import { EMPTY_CERTIFICATION_EDITOR_VALUES, mapEditorValuesToCreateCertificationInput, mapEditorValuesToUpdateCertificationInput, type CertificationEditorValues } from '../types'

interface Props { mode: 'create' | 'edit'; certId?: string; initialValues?: CertificationEditorValues; cloudinaryConfigured: boolean }

export function CertificationEditor({ mode, certId, initialValues = EMPTY_CERTIFICATION_EDITOR_VALUES, cloudinaryConfigured }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = <K extends keyof CertificationEditorValues>(k: K, v: CertificationEditorValues[K]) => setValues((c) => ({ ...c, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); startTransition(async () => {
      const result = mode === 'create' ? await createCertification(mapEditorValuesToCreateCertificationInput(values)) : await updateCertification(mapEditorValuesToUpdateCertificationInput(certId!, values))
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.push(`/admin/certifications/${result.data.id}`); router.refresh()
    }) }} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}
      <AdminCard><div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Name" name="name" error={fieldErrors.name}><AdminTextInput value={values.name} onChange={(e) => set('name', e.target.value)} required /></AdminField>
        <AdminField label="Provider" name="provider" error={fieldErrors.provider}><AdminTextInput value={values.provider} onChange={(e) => set('provider', e.target.value)} required /></AdminField>
        <AdminField label="Provider logo slug" name="providerLogo" hint="Simple Icons slug for the provider logo."><AdminTextInput value={values.providerLogo} onChange={(e) => set('providerLogo', e.target.value)} /></AdminField>
        <AdminField label="Completion date" name="completionDate"><AdminTextInput value={values.completionDate} onChange={(e) => set('completionDate', e.target.value)} /></AdminField>
        <AdminField label="Credential URL" name="credentialUrl" error={fieldErrors.credentialUrl}><AdminTextInput type="url" value={values.credentialUrl} onChange={(e) => set('credentialUrl', e.target.value)} required /></AdminField>
        <AdminField label="Verify URL" name="verifyUrl" error={fieldErrors.verifyUrl}><AdminTextInput type="url" value={values.verifyUrl} onChange={(e) => set('verifyUrl', e.target.value)} required /></AdminField>
        <AdminField label="Order" name="order"><AdminTextInput type="number" min={0} value={values.order} onChange={(e) => set('order', Number(e.target.value) || 0)} /></AdminField>
        <div className="md:col-span-2">
          <MediaUploadField label="Certificate image" name="image" folder="certificates" value={{ mediaId: null, url: values.image }} onChange={(m) => set('image', m.url)} error={fieldErrors.image} cloudinaryConfigured={cloudinaryConfigured} fallbackPreviewUrl={values.image || undefined} />
        </div>
      </div></AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/certifications" className="inline-flex min-h-10 items-center rounded-lg border border-white/[0.08] px-4 text-sm text-zinc-300">Cancel</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60')}>{isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}{mode === 'create' ? 'Create' : 'Save'}</button>
      </div>
    </form>
  )
}
