'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createJourneyMilestone, updateJourneyMilestone } from '@/features/portfolio/journey/actions'
import {
  AdminCard,
  AdminField,
  AdminSelect,
  AdminTextInput,
  AdminTextarea,
  StringListField,
  applyFieldErrors,
} from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { JourneyIcon } from '@/features/portfolio/journey/types'
import type { AccentColor } from '@/shared/types'
import {
  EMPTY_JOURNEY_EDITOR_VALUES,
  mapEditorValuesToCreateJourneyInput,
  mapEditorValuesToUpdateJourneyInput,
  type JourneyEditorValues,
} from '../types'

const ICON_OPTIONS = [
  'GraduationCap', 'Brain', 'Workflow', 'Building2', 'Globe', 'Zap', 'Image', 'Target', 'Sparkles', 'Award', 'Code2', 'TerminalSquare',
].map((value) => ({ value, label: value }))

const ACCENT_OPTIONS = ['purple', 'emerald', 'cyan', 'amber', 'pink'].map((value) => ({ value, label: value }))

interface JourneyEditorProps {
  mode: 'create' | 'edit'
  milestoneId?: string
  initialValues?: JourneyEditorValues
}

export function JourneyEditor({ mode, milestoneId, initialValues = EMPTY_JOURNEY_EDITOR_VALUES }: JourneyEditorProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateValue<K extends keyof JourneyEditorValues>(key: K, value: JourneyEditorValues[K]) {
    setValues((c) => ({ ...c, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createJourneyMilestone(mapEditorValuesToCreateJourneyInput(values))
          : await updateJourneyMilestone(mapEditorValuesToUpdateJourneyInput(milestoneId!, values))
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.push(`/admin/journey/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">{formError}</div>}
      <AdminCard as="section">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Label" name="label" error={fieldErrors.label}><AdminTextInput id="label" value={values.label} hasError={Boolean(fieldErrors.label)} onChange={(e) => updateValue('label', e.target.value)} required /></AdminField>
          <AdminField label="Year" name="year" error={fieldErrors.year}><AdminTextInput id="year" value={values.year} hasError={Boolean(fieldErrors.year)} onChange={(e) => updateValue('year', e.target.value)} required /></AdminField>
          <AdminSelect label="Icon" value={values.icon} onChange={(v) => updateValue('icon', v as JourneyIcon)} options={ICON_OPTIONS} />
          <AdminSelect label="Accent" value={values.accent} onChange={(v) => updateValue('accent', v as AccentColor)} options={ACCENT_OPTIONS} />
          <AdminField label="Display order" name="order" error={fieldErrors.order}><AdminTextInput id="order" type="number" min={0} value={values.order} onChange={(e) => updateValue('order', Number(e.target.value) || 0)} /></AdminField>
          <label className="flex items-center gap-3 self-end text-sm text-zinc-300">
            <input type="checkbox" checked={values.isCurrent} onChange={(e) => updateValue('isCurrent', e.target.checked)} className="h-4 w-4 rounded border-white/20" />
            Current milestone
          </label>
          <div className="md:col-span-2">
            <AdminField label="Description" name="description" error={fieldErrors.description}><AdminTextarea id="description" rows={4} value={values.description} hasError={Boolean(fieldErrors.description)} onChange={(e) => updateValue('description', e.target.value)} required /></AdminField>
          </div>
          <div className="md:col-span-2">
            <StringListField label="Sub-items" name="subItems" values={values.subItems} onChange={(subItems) => updateValue('subItems', subItems)} error={fieldErrors.subItems} />
          </div>
        </div>
      </AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/journey" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/[0.08] px-4 text-sm text-zinc-300 hover:text-white">Cancel</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white disabled:opacity-60')}>
          {isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}
          {mode === 'create' ? 'Create milestone' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
