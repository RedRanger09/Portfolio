'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Loader2, Plus, X } from 'lucide-react'
import { slugifyProjectName } from '@/features/portfolio/projects/lib/project-slug'
import { createProject, updateProject } from '@/features/portfolio/projects/actions'
import {
  applyFieldErrors,
  AdminCollapsibleSection,
  AdminField,
  AdminTextInput,
  AdminTextarea,
  StringListField,
  commitTechChip,
} from '@/features/admin/shared'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import type { MediaFieldValue } from '@/features/media/types'
import type { MediaGalleryItem } from '@/features/media/types'
import { ProjectGalleryEditor } from './project-gallery-editor'
import {
  EMPTY_PROJECT_EDITOR_VALUES,
  mapEditorValuesToCreateInput,
  mapEditorValuesToUpdateInput,
  type ProjectEditorValues,
} from '../types'
import { cn } from '@/shared/utils'

interface ProjectEditorProps {
  mode: 'create' | 'edit'
  projectId?: string
  initialValues?: ProjectEditorValues
  technologySuggestions: string[]
  cloudinaryConfigured: boolean
  galleryItems?: MediaGalleryItem[]
}

function VisibilityToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 rounded border-white/20 bg-background text-primary focus:ring-primary/60"
      />
      {label}
    </label>
  )
}

/** Full case-study CMS editor — parity with the public Project Detail page. */
export function ProjectEditor({
  mode,
  projectId,
  initialValues = EMPTY_PROJECT_EDITOR_VALUES,
  technologySuggestions,
  cloudinaryConfigured,
  galleryItems = [],
}: ProjectEditorProps) {
  const router = useRouter()
  const [values, setValues] = useState<ProjectEditorValues>(initialValues)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [techInput, setTechInput] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const caseStudyUrl = useMemo(() => (values.slug ? `/projects/${values.slug}` : ''), [values.slug])
  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialValues), [values, initialValues])

  function updateValue<K extends keyof ProjectEditorValues>(key: K, value: ProjectEditorValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function handleNameChange(name: string) {
    updateValue('name', name)
    if (!slugTouched) {
      updateValue('slug', slugifyProjectName(name))
    }
  }

  function addTechnology(name: string) {
    const next = commitTechChip(values.techStack, name)
    if (next === values.techStack) return
    updateValue('techStack', next)
    setTechInput('')
  }

  function removeTechnology(index: number) {
    updateValue(
      'techStack',
      values.techStack.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  function moveTechnology(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= values.techStack.length) return
    const next = [...values.techStack]
    const item = next[index]
    if (item === undefined) return
    next.splice(index, 1)
    next.splice(target, 0, item)
    updateValue('techStack', next)
  }

  function handleThumbnailChange(media: MediaFieldValue) {
    updateValue('screenshotMediaId', media.mediaId)
    updateValue('screenshot', media.url || EMPTY_PROJECT_EDITOR_VALUES.screenshot)
  }

  function handleDiagramChange(field: 'architectureImage' | 'ragPipelineImage', media: MediaFieldValue) {
    updateValue(field, media.url || '')
  }

  function updateMetric(index: number, key: 'label' | 'value', value: string) {
    updateValue(
      'metrics',
      values.metrics.map((metric, metricIndex) => (metricIndex === index ? { ...metric, [key]: value } : metric)),
    )
  }

  function removeMetric(index: number) {
    updateValue(
      'metrics',
      values.metrics.filter((_, metricIndex) => metricIndex !== index),
    )
  }

  function addMetric() {
    updateValue('metrics', [...values.metrics, { label: '', value: '' }])
  }

  function moveMetric(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= values.metrics.length) return
    const next = [...values.metrics]
    const item = next[index]
    if (item === undefined) return
    next.splice(index, 1)
    next.splice(target, 0, item)
    updateValue('metrics', next)
  }

  const thumbnailValue: MediaFieldValue = {
    mediaId: values.screenshotMediaId,
    url: values.screenshot,
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const techStack = commitTechChip(values.techStack, techInput)
    if (techStack !== values.techStack) {
      updateValue('techStack', techStack)
      setTechInput('')
    }
    const payload = { ...values, techStack }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createProject(mapEditorValuesToCreateInput(payload))
          : await updateProject(mapEditorValuesToUpdateInput(projectId!, payload))

      if (applyFieldErrors(result, setFieldErrors)) return

      if (!result.success) {
        setFormError(result.error.message)
        return
      }

      router.push(`/admin/projects/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">
          {formError}
        </div>
      )}

      {isDirty && (
        <p className="text-xs text-amber-300/90" aria-live="polite">
          Unsaved changes
        </p>
      )}

      <AdminCollapsibleSection title="Basic Information" description="Identity, slug, and publish state for the projects grid.">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Title" name="name" error={fieldErrors.name}>
            <AdminTextInput id="name" name="name" value={values.name} hasError={Boolean(fieldErrors.name)} onChange={(event) => handleNameChange(event.target.value)} required />
          </AdminField>

          <AdminField label="Slug" name="slug" error={fieldErrors.slug} hint="Used in the public case study URL.">
            <AdminTextInput
              id="slug"
              name="slug"
              value={values.slug}
              hasError={Boolean(fieldErrors.slug)}
              onChange={(event) => {
                setSlugTouched(true)
                updateValue('slug', event.target.value)
              }}
              required
            />
          </AdminField>

          <AdminField label="Category" name="category" error={fieldErrors.category} hint="Also used as the hero eyebrow when eyebrow text is empty.">
            <AdminTextInput id="category" name="category" value={values.category} hasError={Boolean(fieldErrors.category)} onChange={(event) => updateValue('category', event.target.value)} required />
          </AdminField>

          <AdminField label="Display order" name="order" error={fieldErrors.order} hint="Lower numbers appear first in the public grid.">
            <AdminTextInput id="order" name="order" type="number" min={0} value={values.order} hasError={Boolean(fieldErrors.order)} onChange={(event) => updateValue('order', Number(event.target.value) || 0)} />
          </AdminField>

          <div className="md:col-span-2">
            <AdminField label="Case study URL" name="caseStudy" hint="Derived from the slug — updates automatically.">
              <AdminTextInput id="caseStudy" name="caseStudy" value={caseStudyUrl} readOnly className="text-zinc-500" />
            </AdminField>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 md:col-span-2">
            <label className="inline-flex items-center gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked={values.featured} onChange={(event) => updateValue('featured', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-primary/60" />
              Featured on homepage
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked={values.published} onChange={(event) => updateValue('published', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-primary/60" />
              Published (visible as a real project)
            </label>
          </div>
          <p className="text-xs text-zinc-500 md:col-span-2">Unpublished projects render as placeholders on the public site until you publish them.</p>

          <div className="md:col-span-2">
            <MediaUploadField
              label="Thumbnail"
              name="screenshot"
              folder="projects"
              value={thumbnailValue}
              onChange={handleThumbnailChange}
              error={fieldErrors.screenshot ?? fieldErrors.screenshotMediaId}
              hint="Project card and case-study browser mockup image."
              cloudinaryConfigured={cloudinaryConfigured}
              fallbackPreviewUrl={values.screenshot || undefined}
            />
          </div>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection title="Hero" description="Case-study header: eyebrow, title, short description, metrics, and primary links.">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Eyebrow text" name="heroEyebrow" error={fieldErrors.heroEyebrow} hint="Optional. Falls back to category when empty.">
            <AdminTextInput id="heroEyebrow" name="heroEyebrow" value={values.heroEyebrow} hasError={Boolean(fieldErrors.heroEyebrow)} onChange={(event) => updateValue('heroEyebrow', event.target.value)} placeholder={values.category || 'Category'} />
          </AdminField>

          <AdminField label="Project title" name="nameHero" hint="Same as Basic Information title.">
            <AdminTextInput id="nameHero" value={values.name} onChange={(event) => handleNameChange(event.target.value)} />
          </AdminField>

          <div className="md:col-span-2">
            <AdminField label="Short description (tagline)" name="tagline" error={fieldErrors.tagline}>
              <AdminTextInput id="tagline" name="tagline" value={values.tagline} hasError={Boolean(fieldErrors.tagline)} onChange={(event) => updateValue('tagline', event.target.value)} required />
            </AdminField>
          </div>

          <div className="md:col-span-2">
            <AdminField label="Longer description" name="description" error={fieldErrors.description}>
              <AdminTextarea id="description" name="description" rows={4} value={values.description} hasError={Boolean(fieldErrors.description)} onChange={(event) => updateValue('description', event.target.value)} required />
            </AdminField>
          </div>

          <AdminField label="GitHub URL" name="github" error={fieldErrors.github}>
            <AdminTextInput id="github" name="github" type="url" value={values.github} hasError={Boolean(fieldErrors.github)} onChange={(event) => updateValue('github', event.target.value)} placeholder="https://github.com/..." />
          </AdminField>

          <AdminField label="Live demo URL" name="liveDemo" error={fieldErrors.liveDemo} hint="Header CTA and Live Demo section.">
            <AdminTextInput id="liveDemo" name="liveDemo" type="url" value={values.liveDemo} hasError={Boolean(fieldErrors.liveDemo)} onChange={(event) => updateValue('liveDemo', event.target.value)} placeholder="https://..." />
          </AdminField>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">Featured metrics</p>
            <VisibilityToggle checked={values.showMetrics} onChange={(checked) => updateValue('showMetrics', checked)} label="Show metrics" />
          </div>
          {fieldErrors.metrics ? <p className="text-xs text-pink-300">{fieldErrors.metrics}</p> : null}
          <div className="space-y-2">
            {values.metrics.map((metric, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" onClick={() => moveMetric(index, -1)} disabled={index === 0} className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 disabled:opacity-30" aria-label={`Move metric ${index + 1} up`}>
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => moveMetric(index, 1)} disabled={index === values.metrics.length - 1} className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 disabled:opacity-30" aria-label={`Move metric ${index + 1} down`}>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <input value={metric.label} onChange={(event) => updateMetric(index, 'label', event.target.value)} placeholder="Label" className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" />
                <input value={metric.value} onChange={(event) => updateMetric(index, 'value', event.target.value)} placeholder="Value" className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" />
                <button type="button" onClick={() => removeMetric(index)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white" aria-label={`Remove metric ${index + 1}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addMetric} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-zinc-300 hover:border-white/20 hover:text-white">
              <Plus className="h-4 w-4" /> Add metric
            </button>
          </div>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Overview"
        description="Opening narrative for the case study."
        headerAction={<VisibilityToggle checked={values.showOverview} onChange={(checked) => updateValue('showOverview', checked)} label="Show Overview" />}
      >
        <div className="space-y-5">
          <AdminField label="Title" name="overviewTitle" error={fieldErrors.overviewTitle}>
            <AdminTextInput id="overviewTitle" value={values.overviewTitle} hasError={Boolean(fieldErrors.overviewTitle)} onChange={(event) => updateValue('overviewTitle', event.target.value)} />
          </AdminField>
          <AdminField label="Body" name="overview" error={fieldErrors.overview}>
            <AdminTextarea id="overview" rows={5} value={values.overview} hasError={Boolean(fieldErrors.overview)} onChange={(event) => updateValue('overview', event.target.value)} />
          </AdminField>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Problem"
        description="Optional problem statement shown beside Tech Stack."
        defaultOpen={false}
        headerAction={<VisibilityToggle checked={values.showProblem} onChange={(checked) => updateValue('showProblem', checked)} label="Show Problem" />}
      >
        <div className="space-y-5">
          <AdminField label="Title" name="problemTitle" error={fieldErrors.problemTitle}>
            <AdminTextInput id="problemTitle" value={values.problemTitle} hasError={Boolean(fieldErrors.problemTitle)} onChange={(event) => updateValue('problemTitle', event.target.value)} />
          </AdminField>
          <AdminField label="Body" name="problem" error={fieldErrors.problem}>
            <AdminTextarea id="problem" rows={4} value={values.problem} hasError={Boolean(fieldErrors.problem)} onChange={(event) => updateValue('problem', event.target.value)} />
          </AdminField>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Tech Stack"
        description="Technology chips on the case study. Reorder, add, or remove."
        headerAction={<VisibilityToggle checked={values.showTechStack} onChange={(checked) => updateValue('showTechStack', checked)} label="Show Tech Stack" />}
      >
        <AdminField label="Section title" name="techStackTitle" error={fieldErrors.techStackTitle}>
          <AdminTextInput id="techStackTitle" value={values.techStackTitle} hasError={Boolean(fieldErrors.techStackTitle)} onChange={(event) => updateValue('techStackTitle', event.target.value)} />
        </AdminField>
        <AdminField
          label="Technologies"
          name="techStack"
          error={fieldErrors.techStack}
          hint="Type any technology name — suggestions are optional. Press Enter, click Add, or Save to commit."
        >
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              {values.techStack.map((tech, index) => (
                <div key={`${tech}-${index}`} className="flex gap-2">
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => moveTechnology(index, -1)} disabled={index === 0} className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 disabled:opacity-30" aria-label={`Move ${tech} up`}>
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => moveTechnology(index, 1)} disabled={index === values.techStack.length - 1} className="inline-flex h-5 w-8 items-center justify-center rounded border border-white/[0.08] text-zinc-500 disabled:opacity-30" aria-label={`Move ${tech} down`}>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="flex min-h-10 flex-1 items-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-zinc-300">{tech}</span>
                  <button type="button" onClick={() => removeTechnology(index)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white" aria-label={`Remove ${tech}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                list="project-tech-suggestions"
                value={techInput}
                onChange={(event) => setTechInput(event.target.value)}
                onBlur={() => {
                  if (techInput.trim()) addTechnology(techInput)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTechnology(techInput)
                  }
                }}
                placeholder="Add any technology"
                className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
              <button
                type="button"
                onClick={() => addTechnology(techInput)}
                disabled={!techInput.trim()}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-sm text-zinc-300 hover:border-white/20 hover:text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
            <datalist id="project-tech-suggestions">
              {technologySuggestions.map((tech) => (
                <option key={tech} value={tech} />
              ))}
            </datalist>
          </div>
        </AdminField>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Architecture"
        description="Architecture points and optional diagram."
        headerAction={<VisibilityToggle checked={values.showArchitecture} onChange={(checked) => updateValue('showArchitecture', checked)} label="Show Architecture" />}
      >
        <div className="space-y-5">
          <AdminField label="Title" name="architectureTitle" error={fieldErrors.architectureTitle}>
            <AdminTextInput id="architectureTitle" value={values.architectureTitle} hasError={Boolean(fieldErrors.architectureTitle)} onChange={(event) => updateValue('architectureTitle', event.target.value)} />
          </AdminField>
          <StringListField label="Architecture points" name="architecture" values={values.architecture} onChange={(next) => updateValue('architecture', next)} error={fieldErrors.architecture} reorderable placeholder="e.g. Documents embedded" />
          <div className="flex justify-end">
            <VisibilityToggle checked={values.showArchitectureImage} onChange={(checked) => updateValue('showArchitectureImage', checked)} label="Show architecture diagram" />
          </div>
          <MediaUploadField
            label="Architecture diagram"
            name="architectureImage"
            folder="projects"
            value={{ mediaId: null, url: values.architectureImage }}
            onChange={(media) => handleDiagramChange('architectureImage', media)}
            error={fieldErrors.architectureImage}
            cloudinaryConfigured={cloudinaryConfigured}
            fallbackPreviewUrl={values.architectureImage || undefined}
          />
          <div className="flex justify-end">
            <VisibilityToggle checked={values.showRagPipelineImage} onChange={(checked) => updateValue('showRagPipelineImage', checked)} label="Show RAG pipeline diagram" />
          </div>
          <MediaUploadField
            label="RAG pipeline diagram"
            name="ragPipelineImage"
            folder="projects"
            value={{ mediaId: null, url: values.ragPipelineImage }}
            onChange={(media) => handleDiagramChange('ragPipelineImage', media)}
            error={fieldErrors.ragPipelineImage}
            cloudinaryConfigured={cloudinaryConfigured}
            fallbackPreviewUrl={values.ragPipelineImage || undefined}
          />
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Implementation"
        description="How the project was built — bullet list."
        headerAction={<VisibilityToggle checked={values.showImplementation} onChange={(checked) => updateValue('showImplementation', checked)} label="Show Implementation" />}
      >
        <AdminField label="Title" name="implementationTitle" error={fieldErrors.implementationTitle}>
          <AdminTextInput id="implementationTitle" value={values.implementationTitle} hasError={Boolean(fieldErrors.implementationTitle)} onChange={(event) => updateValue('implementationTitle', event.target.value)} />
        </AdminField>
        <div className="mt-5">
          <StringListField label="Implementation bullets" name="implementation" values={values.implementation} onChange={(next) => updateValue('implementation', next)} error={fieldErrors.implementation} reorderable />
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Challenges"
        description="Challenge cards on the case study."
        headerAction={<VisibilityToggle checked={values.showChallenges} onChange={(checked) => updateValue('showChallenges', checked)} label="Show Challenges" />}
      >
        <AdminField label="Title" name="challengesTitle" error={fieldErrors.challengesTitle}>
          <AdminTextInput id="challengesTitle" value={values.challengesTitle} hasError={Boolean(fieldErrors.challengesTitle)} onChange={(event) => updateValue('challengesTitle', event.target.value)} />
        </AdminField>
        <div className="mt-5">
          <StringListField label="Challenge cards" name="challenges" values={values.challenges} onChange={(next) => updateValue('challenges', next)} error={fieldErrors.challenges} reorderable />
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Lessons Learned"
        description="Lesson cards on the case study."
        headerAction={<VisibilityToggle checked={values.showLessonsLearned} onChange={(checked) => updateValue('showLessonsLearned', checked)} label="Show Lessons Learned" />}
      >
        <AdminField label="Title" name="lessonsLearnedTitle" error={fieldErrors.lessonsLearnedTitle}>
          <AdminTextInput id="lessonsLearnedTitle" value={values.lessonsLearnedTitle} hasError={Boolean(fieldErrors.lessonsLearnedTitle)} onChange={(event) => updateValue('lessonsLearnedTitle', event.target.value)} />
        </AdminField>
        <div className="mt-5">
          <StringListField label="Lesson cards" name="lessonsLearned" values={values.lessonsLearned} onChange={(next) => updateValue('lessonsLearned', next)} error={fieldErrors.lessonsLearned} reorderable />
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Future Improvements"
        description="Improvement cards on the case study."
        headerAction={<VisibilityToggle checked={values.showFutureImprovements} onChange={(checked) => updateValue('showFutureImprovements', checked)} label="Show Future Improvements" />}
      >
        <AdminField label="Title" name="futureImprovementsTitle" error={fieldErrors.futureImprovementsTitle}>
          <AdminTextInput id="futureImprovementsTitle" value={values.futureImprovementsTitle} hasError={Boolean(fieldErrors.futureImprovementsTitle)} onChange={(event) => updateValue('futureImprovementsTitle', event.target.value)} />
        </AdminField>
        <div className="mt-5">
          <StringListField label="Improvement cards" name="futureImprovements" values={values.futureImprovements} onChange={(next) => updateValue('futureImprovements', next)} error={fieldErrors.futureImprovements} reorderable />
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Screenshot Gallery"
        description="Upload, caption, reorder, and replace case-study screenshots."
        headerAction={<VisibilityToggle checked={values.showGallery} onChange={(checked) => updateValue('showGallery', checked)} label="Show Gallery" />}
      >
        <AdminField label="Section title" name="galleryTitle" error={fieldErrors.galleryTitle}>
          <AdminTextInput id="galleryTitle" value={values.galleryTitle} hasError={Boolean(fieldErrors.galleryTitle)} onChange={(event) => updateValue('galleryTitle', event.target.value)} />
        </AdminField>
        <div className="mt-5">
          {mode === 'edit' && projectId ? (
            <ProjectGalleryEditor projectId={projectId} initialItems={galleryItems} cloudinaryConfigured={cloudinaryConfigured} embedded />
          ) : (
            <p className="text-sm text-zinc-500">Save the project first, then upload unlimited case-study screenshots here.</p>
          )}
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Video Demo"
        description="YouTube walkthrough embedded on the public case study."
        headerAction={<VisibilityToggle checked={values.showVideo} onChange={(checked) => updateValue('showVideo', checked)} label="Show Demo Video" />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Section title" name="videoTitle" error={fieldErrors.videoTitle}>
            <AdminTextInput id="videoTitle" value={values.videoTitle} hasError={Boolean(fieldErrors.videoTitle)} onChange={(event) => updateValue('videoTitle', event.target.value)} />
          </AdminField>
          <AdminField label="Video label" name="demoLabel" error={fieldErrors['demo.label']} hint="Accessible title for the embed.">
            <AdminTextInput id="demoLabel" value={values.demoLabel} hasError={Boolean(fieldErrors['demo.label'])} onChange={(event) => updateValue('demoLabel', event.target.value)} />
          </AdminField>
          <div className="md:col-span-2">
            <AdminField label="YouTube URL" name="demoHref" error={fieldErrors['demo.href'] ?? fieldErrors.demo} hint="Accepts youtube.com and youtu.be links.">
              <AdminTextInput id="demoHref" type="url" value={values.demoHref} hasError={Boolean(fieldErrors['demo.href'] ?? fieldErrors.demo)} onChange={(event) => updateValue('demoHref', event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </AdminField>
          </div>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Live Demo"
        description="Closing CTA when a live demo URL is set. Hidden automatically when empty."
        headerAction={<VisibilityToggle checked={values.showLiveDemo} onChange={(checked) => updateValue('showLiveDemo', checked)} label="Show Live Demo" />}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Section title" name="liveDemoTitle" error={fieldErrors.liveDemoTitle}>
            <AdminTextInput id="liveDemoTitle" value={values.liveDemoTitle} hasError={Boolean(fieldErrors.liveDemoTitle)} onChange={(event) => updateValue('liveDemoTitle', event.target.value)} />
          </AdminField>
          <AdminField label="Live demo URL" name="liveDemoSection" error={fieldErrors.liveDemo}>
            <AdminTextInput id="liveDemoSection" type="url" value={values.liveDemo} hasError={Boolean(fieldErrors.liveDemo)} onChange={(event) => updateValue('liveDemo', event.target.value)} placeholder="https://..." />
          </AdminField>
        </div>
      </AdminCollapsibleSection>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border border-white/[0.08] bg-surface/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/[0.08] px-4 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
            Cancel
          </Link>
          {isDirty ? <span className="text-xs text-amber-300">Unsaved changes</span> : <span className="text-xs text-zinc-500">All changes saved</span>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white shadow-glow transition hover:bg-gradient-cta-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60',
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {mode === 'create' ? 'Create project' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
