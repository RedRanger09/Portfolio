'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { updateHero } from '@/features/portfolio/hero/actions'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import { AdminCard, AdminField, AdminSelect, AdminTextInput, AdminTextarea, StringListField, applyFieldErrors } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { AccentColor } from '@/shared/types'
import type { HeroCta, HeroCtaIcon, HeroEditorValues, HeroInterestIcon, InterestCard } from '../types'
import type { CtaVariant } from '@/features/portfolio/hero/types'

const INTEREST_ICONS: HeroInterestIcon[] = ['GraduationCap', 'Code2', 'Brain']
const CTA_ICONS: HeroCtaIcon[] = ['FolderKanban', 'Download', 'GitBranch', 'BriefcaseBusiness']
const CTA_VARIANTS: CtaVariant[] = ['primary', 'secondary', 'ghost']
const ACCENTS: AccentColor[] = ['purple', 'emerald', 'cyan', 'amber', 'pink']

interface Props { initialValues: HeroEditorValues; cloudinaryConfigured: boolean }

export function HeroEditor({ initialValues, cloudinaryConfigured }: Props) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function updateCard(index: number, patch: Partial<InterestCard>) {
    setValues((c) => ({ ...c, interestCards: c.interestCards.map((card, i) => (i === index ? { ...card, ...patch } : card)) }))
  }

  function updateCta(index: number, patch: Partial<HeroCta>) {
    setValues((c) => ({ ...c, ctas: c.ctas.map((cta, i) => (i === index ? { ...cta, ...patch } : cta)) }))
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); startTransition(async () => {
      const result = await updateHero(values)
      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }
      router.refresh()
    }) }} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">{formError}</div>}
      <AdminCard as="section" aria-label="Hero copy">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Eyebrow" name="eyebrow" error={fieldErrors.eyebrow}><AdminTextInput value={values.eyebrow} onChange={(e) => setValues((c) => ({ ...c, eyebrow: e.target.value }))} required /></AdminField>
          <AdminField label="Title" name="title" error={fieldErrors.title}><AdminTextInput value={values.title} onChange={(e) => setValues((c) => ({ ...c, title: e.target.value }))} required /></AdminField>
          <AdminField label="Subtitle" name="subtitle" error={fieldErrors.subtitle}><AdminTextInput value={values.subtitle} onChange={(e) => setValues((c) => ({ ...c, subtitle: e.target.value }))} required /></AdminField>
          <div className="md:col-span-2"><AdminField label="Description" name="description" error={fieldErrors.description}><AdminTextarea rows={4} value={values.description} onChange={(e) => setValues((c) => ({ ...c, description: e.target.value }))} required /></AdminField></div>
          <div className="md:col-span-2">
            <MediaUploadField label="Profile image" name="profileImage" folder="hero" value={{ mediaId: null, url: values.profileImage }} onChange={(m) => setValues((c) => ({ ...c, profileImage: m.url }))} cloudinaryConfigured={cloudinaryConfigured} fallbackPreviewUrl={values.profileImage} />
          </div>
        </div>
      </AdminCard>
      <AdminCard as="section" aria-label="Interest cards">
        <div className="space-y-6">
          {values.interestCards.map((card, index) => (
            <div key={index} className="rounded-lg border border-white/[0.08] p-4">
              <p className="mb-3 text-sm font-medium text-white">Card {index + 1}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminSelect label="Icon" value={card.icon} onChange={(v) => updateCard(index, { icon: v as HeroInterestIcon })} options={INTEREST_ICONS.map((v) => ({ value: v, label: v }))} />
                <AdminSelect label="Accent" value={card.accent} onChange={(v) => updateCard(index, { accent: v as AccentColor })} options={ACCENTS.map((v) => ({ value: v, label: v }))} />
                <AdminField label="Label" name={`card-${index}-label`}><AdminTextInput value={card.label} onChange={(e) => updateCard(index, { label: e.target.value })} /></AdminField>
                <AdminField label="Title" name={`card-${index}-title`}><AdminTextInput value={card.title} onChange={(e) => updateCard(index, { title: e.target.value })} /></AdminField>
                <div className="md:col-span-2"><AdminField label="Subtitle" name={`card-${index}-subtitle`}><AdminTextInput value={card.subtitle} onChange={(e) => updateCard(index, { subtitle: e.target.value })} /></AdminField></div>
                <div className="md:col-span-2"><StringListField label="Items" name={`card-${index}-items`} values={card.items} onChange={(items) => updateCard(index, { items })} /></div>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminCard as="section" aria-label="CTAs">
        <div className="space-y-6">
          {values.ctas.map((cta, index) => (
            <div key={index} className="rounded-lg border border-white/[0.08] p-4">
              <p className="mb-3 text-sm font-medium text-white">CTA {index + 1}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminField label="Label" name={`cta-${index}-label`}><AdminTextInput value={cta.label} onChange={(e) => updateCta(index, { label: e.target.value })} /></AdminField>
                <AdminField label="Href" name={`cta-${index}-href`}><AdminTextInput value={cta.href} onChange={(e) => updateCta(index, { href: e.target.value })} /></AdminField>
                <AdminSelect label="Variant" value={cta.variant} onChange={(v) => updateCta(index, { variant: v as CtaVariant })} options={CTA_VARIANTS.map((v) => ({ value: v, label: v }))} />
                <AdminSelect label="Icon" value={cta.icon} onChange={(v) => updateCta(index, { icon: v as HeroCtaIcon })} options={CTA_ICONS.map((v) => ({ value: v, label: v }))} />
                <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={Boolean(cta.download)} onChange={(e) => updateCta(index, { download: e.target.checked })} /> Download link</label>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link href="/#top" target="_blank" className="inline-flex min-h-10 items-center text-sm text-zinc-400 hover:text-white">Preview on site</Link>
        <button type="submit" disabled={isPending} className={cn('inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm text-white disabled:opacity-60')}>{isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" />}Save hero</button>
      </div>
    </form>
  )
}
