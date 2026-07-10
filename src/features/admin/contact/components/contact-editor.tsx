'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { updateContactInformation } from '@/features/portfolio/contact/actions'
import { AdminCard, AdminField, AdminSelect, AdminTextInput, AdminTextarea, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { ContactMethodIcon } from '@/features/portfolio/contact/types'
import type { ContactEditorValues } from '../types'

const ICON_OPTIONS = ['github', 'linkedin', 'email', 'location'].map((v) => ({ value: v, label: v }))

interface Props { initialValues: ContactEditorValues }

export function ContactEditor({ initialValues }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateMethod(index: number, patch: Partial<ContactEditorValues['methods'][number]>) {
    setValues((c) => ({ ...c, methods: c.methods.map((m, i) => (i === index ? { ...m, ...patch } : m)) }))
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); startTransition(async () => {
      const result = await updateContactInformation(values)
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.refresh()
    }) }} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}
      <AdminCard><div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Label" name="label" error={fieldErrors.label}><AdminTextInput value={values.label} onChange={(e) => setValues((c) => ({ ...c, label: e.target.value }))} required /></AdminField>
        <AdminField label="Title" name="title" error={fieldErrors.title}><AdminTextInput value={values.title} onChange={(e) => setValues((c) => ({ ...c, title: e.target.value }))} required /></AdminField>
        <div className="md:col-span-2"><AdminField label="Description" name="description" error={fieldErrors.description}><AdminTextarea rows={4} value={values.description} onChange={(e) => setValues((c) => ({ ...c, description: e.target.value }))} required /></AdminField></div>
        <AdminField label="Say hello label" name="sayHelloLabel" error={fieldErrors.sayHelloLabel}><AdminTextInput value={values.sayHelloLabel} onChange={(e) => setValues((c) => ({ ...c, sayHelloLabel: e.target.value }))} required /></AdminField>
        <AdminField label="Say hello href" name="sayHelloHref" error={fieldErrors.sayHelloHref}><AdminTextInput value={values.sayHelloHref} onChange={(e) => setValues((c) => ({ ...c, sayHelloHref: e.target.value }))} required /></AdminField>
      </div></AdminCard>
      <AdminCard as="section" aria-label="Contact methods">
        <div className="space-y-4">
          {values.methods.map((method, index) => (
            <div key={index} className="rounded-lg border border-white/[0.08] p-4">
              <p className="mb-3 text-sm font-medium text-white">Method {index + 1}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminSelect label="Icon" value={method.icon} onChange={(v) => updateMethod(index, { icon: v as ContactMethodIcon })} options={ICON_OPTIONS} />
                <AdminField label="Label" name={`method-${index}-label`}><AdminTextInput value={method.label} onChange={(e) => updateMethod(index, { label: e.target.value })} /></AdminField>
                <AdminField label="Value" name={`method-${index}-value`}><AdminTextInput value={method.value} onChange={(e) => updateMethod(index, { value: e.target.value })} /></AdminField>
                <AdminField label="Href" name={`method-${index}-href`}><AdminTextInput value={method.href} onChange={(e) => updateMethod(index, { href: e.target.value })} /></AdminField>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href="/#contact" target="_blank" className="text-sm text-zinc-400 hover:text-white">Preview on site</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60')}>{isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}Save contact</button>
      </div>
    </form>
  )
}
