'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { updateAbout } from '@/features/portfolio/about/actions'
import { AdminCard, AdminField, AdminTextInput, StringListField, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { AboutEditorValues } from '../types'

interface Props { initialValues: AboutEditorValues }

export function AboutEditor({ initialValues }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form onSubmit={(e) => { e.preventDefault(); startTransition(async () => {
      const result = await updateAbout(values)
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.refresh()
    }) }} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}
      <AdminCard><div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Label" name="label" error={fieldErrors.label}><AdminTextInput value={values.label} onChange={(e) => setValues((c) => ({ ...c, label: e.target.value }))} required /></AdminField>
        <AdminField label="Title" name="title" error={fieldErrors.title}><AdminTextInput value={values.title} onChange={(e) => setValues((c) => ({ ...c, title: e.target.value }))} required /></AdminField>
        <div className="md:col-span-2"><AdminField label="Subtitle" name="subtitle" error={fieldErrors.subtitle}><AdminTextInput value={values.subtitle} onChange={(e) => setValues((c) => ({ ...c, subtitle: e.target.value }))} required /></AdminField></div>
        <div className="md:col-span-2"><StringListField label="Story paragraphs" name="story" values={values.story} onChange={(story) => setValues((c) => ({ ...c, story }))} error={fieldErrors.story} /></div>
        <AdminField label="Currently learning title" name="currentlyLearning.title"><AdminTextInput value={values.currentlyLearning.title} onChange={(e) => setValues((c) => ({ ...c, currentlyLearning: { ...c.currentlyLearning, title: e.target.value } }))} /></AdminField>
        <div className="md:col-span-2"><StringListField label="Currently learning items" name="currentlyLearning.items" values={values.currentlyLearning.items} onChange={(items) => setValues((c) => ({ ...c, currentlyLearning: { ...c.currentlyLearning, items } }))} /></div>
        <AdminField label="Interests label" name="interestsLabel" error={fieldErrors.interestsLabel}><AdminTextInput value={values.interestsLabel} onChange={(e) => setValues((c) => ({ ...c, interestsLabel: e.target.value }))} required /></AdminField>
        <div className="md:col-span-2"><StringListField label="Interests" name="interests" values={values.interests} onChange={(interests) => setValues((c) => ({ ...c, interests }))} error={fieldErrors.interests} /></div>
      </div></AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href="/#about" target="_blank" className="text-sm text-zinc-400 hover:text-white">Preview on site</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60')}>{isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}Save about</button>
      </div>
    </form>
  )
}
