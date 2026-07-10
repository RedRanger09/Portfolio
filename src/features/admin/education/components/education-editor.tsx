'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createEducation, updateEducation } from '@/features/portfolio/education/actions'
import { AdminCard, AdminField, AdminSelect, AdminTextInput, AdminTextarea, StringListField, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { EducationType } from '@/features/portfolio/education/types'
import { EMPTY_EDUCATION_EDITOR_VALUES, mapEditorValuesToCreateEducationInput, mapEditorValuesToUpdateEducationInput, type EducationEditorValues } from '../types'

interface Props { mode: 'create' | 'edit'; entryId?: string; initialValues?: EducationEditorValues }

export function EducationEditor({ mode, entryId, initialValues = EMPTY_EDUCATION_EDITOR_VALUES }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = <K extends keyof EducationEditorValues>(k: K, v: EducationEditorValues[K]) => setValues((c) => ({ ...c, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); setFormError(null); setFieldErrors({}); startTransition(async () => {
      const result = mode === 'create' ? await createEducation(mapEditorValuesToCreateEducationInput(values)) : await updateEducation(mapEditorValuesToUpdateEducationInput(entryId!, values))
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.push(`/admin/education/${result.data.id}`); router.refresh()
    }) }} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}
      <AdminCard><div className="grid gap-5 md:grid-cols-2">
        <AdminSelect label="Type" value={values.type} onChange={(v) => set('type', v as EducationType)} options={[{ value: 'school', label: 'School' }, { value: 'college', label: 'College' }]} />
        <AdminField label="Institution" name="institution" error={fieldErrors.institution}><AdminTextInput value={values.institution} onChange={(e) => set('institution', e.target.value)} required /></AdminField>
        <AdminField label="Short name" name="shortName"><AdminTextInput value={values.shortName} onChange={(e) => set('shortName', e.target.value)} /></AdminField>
        <AdminField label="Degree" name="degree" error={fieldErrors.degree}><AdminTextInput value={values.degree} onChange={(e) => set('degree', e.target.value)} required /></AdminField>
        <AdminField label="Period" name="period" error={fieldErrors.period}><AdminTextInput value={values.period} onChange={(e) => set('period', e.target.value)} required /></AdminField>
        <AdminField label="Location" name="location" error={fieldErrors.location}><AdminTextInput value={values.location} onChange={(e) => set('location', e.target.value)} required /></AdminField>
        <AdminField label="Order" name="order"><AdminTextInput type="number" min={0} value={values.order} onChange={(e) => set('order', Number(e.target.value) || 0)} /></AdminField>
        <AdminField label="Expected graduation" name="expectedGraduation"><AdminTextInput value={values.expectedGraduation} onChange={(e) => set('expectedGraduation', e.target.value)} /></AdminField>
        <AdminField label="Current semester" name="currentSemester"><AdminTextInput value={values.currentSemester} onChange={(e) => set('currentSemester', e.target.value)} /></AdminField>
        <div className="md:col-span-2"><AdminField label="Description" name="description" error={fieldErrors.description}><AdminTextarea rows={4} value={values.description} onChange={(e) => set('description', e.target.value)} required /></AdminField></div>
        <div className="md:col-span-2"><StringListField label="Highlights" name="highlights" values={values.highlights} onChange={(highlights) => set('highlights', highlights)} /></div>
      </div></AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/education" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/[0.08] px-4 text-sm text-zinc-300">Cancel</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60')}>{isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}{mode === 'create' ? 'Create entry' : 'Save changes'}</button>
      </div>
    </form>
  )
}
