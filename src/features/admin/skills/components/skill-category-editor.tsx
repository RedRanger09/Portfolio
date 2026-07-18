'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'
import { createSkillCategory, updateSkillCategory } from '@/features/portfolio/skills/actions'
import {
  AdminCard,
  AdminField,
  AdminSelect,
  AdminTextInput,
  AdminTextarea,
  applyFieldErrors,
  commitTechChip,
} from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { SkillGroupIcon } from '@/features/portfolio/skills/types'
import type { AccentColor } from '@/shared/types'
import {
  EMPTY_SKILL_CATEGORY_EDITOR_VALUES,
  mapEditorValuesToCreateSkillCategoryInput,
  mapEditorValuesToUpdateSkillCategoryInput,
  type SkillCategoryEditorValues,
} from '../types'

const ICON_OPTIONS = ['Code2', 'Brain', 'Layout', 'Wrench', 'Cloud'].map((v) => ({ value: v, label: v }))
const ACCENT_OPTIONS = ['purple', 'emerald', 'cyan', 'amber', 'pink'].map((v) => ({ value: v, label: v }))

interface Props {
  mode: 'create' | 'edit'
  categoryId?: string
  initialValues?: SkillCategoryEditorValues
  technologySuggestions: string[]
}

export function SkillCategoryEditor({
  mode,
  categoryId,
  initialValues = EMPTY_SKILL_CATEGORY_EDITOR_VALUES,
  technologySuggestions,
}: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [techInput, setTechInput] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = <K extends keyof SkillCategoryEditorValues>(k: K, v: SkillCategoryEditorValues[K]) =>
    setValues((c) => ({ ...c, [k]: v }))

  function addTech(name: string) {
    const next = commitTechChip(values.items, name)
    if (next === values.items) return
    set('items', next)
    setTechInput('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const items = commitTechChip(values.items, techInput)
        if (items !== values.items) {
          set('items', items)
          setTechInput('')
        }
        const payload = { ...values, items }

        startTransition(async () => {
          const result =
            mode === 'create'
              ? await createSkillCategory(mapEditorValuesToCreateSkillCategoryInput(payload))
              : await updateSkillCategory(mapEditorValuesToUpdateSkillCategoryInput(categoryId!, payload))
          if (applyFieldErrors(result, setFieldErrors)) return
          if (!result.success) {
            setFormError(result.error.message)
            return
          }
          router.push(`/admin/skills/${result.data.id}`)
          router.refresh()
        })
      }}
      className="space-y-6"
    >
      {formError && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>
      )}
      <AdminCard>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Title" name="title" error={fieldErrors.title}>
            <AdminTextInput value={values.title} onChange={(e) => set('title', e.target.value)} required />
          </AdminField>
          <AdminSelect label="Icon" value={values.icon} onChange={(v) => set('icon', v as SkillGroupIcon)} options={ICON_OPTIONS} />
          <AdminSelect label="Accent" value={values.accent} onChange={(v) => set('accent', v as AccentColor)} options={ACCENT_OPTIONS} />
          <AdminField label="Order" name="order">
            <AdminTextInput type="number" min={0} value={values.order} onChange={(e) => set('order', Number(e.target.value) || 0)} />
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="Note" name="note" error={fieldErrors.note}>
              <AdminTextarea rows={2} value={values.note} onChange={(e) => set('note', e.target.value)} required />
            </AdminField>
          </div>
          <div className="md:col-span-2">
            <AdminField
              label="Technologies"
              name="items"
              error={fieldErrors.items}
              hint="Type any technology name — suggestions are optional. Press Enter, click Add, or Save to commit."
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {values.items.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => set('items', values.items.filter((t) => t !== tech))}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    list="skill-tech-suggestions"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onBlur={() => {
                      if (techInput.trim()) addTech(techInput)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTech(techInput)
                      }
                    }}
                    placeholder="Add any technology"
                    className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addTech(techInput)}
                    disabled={!techInput.trim()}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-sm text-zinc-300 hover:border-white/20 hover:text-white disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add
                  </button>
                </div>
                <datalist id="skill-tech-suggestions">
                  {technologySuggestions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </AdminField>
          </div>
        </div>
      </AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/skills"
          className="inline-flex min-h-10 items-center rounded-lg border border-white/[0.08] px-4 text-sm text-zinc-300"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60',
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}
          {mode === 'create' ? 'Create category' : 'Save'}
        </button>
      </div>
    </form>
  )
}
