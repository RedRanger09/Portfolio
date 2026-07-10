'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createBlogPost, updateBlogPost } from '@/features/blog/actions'
import { slugifyBlogTitle } from '@/features/blog/schemas/blog-post.schema'
import { applyFieldErrors, AdminCard, AdminField, AdminTextInput, AdminTextarea, StringListField } from '@/features/admin/shared'
import { MediaUploadField } from '@/features/media/components/media-upload-field'
import type { MediaFieldValue } from '@/features/media/types'
import {
  EMPTY_BLOG_EDITOR_VALUES,
  mapEditorValuesToCreateInput,
  mapEditorValuesToUpdateInput,
  type BlogEditorValues,
} from '../types'

interface BlogEditorProps {
  mode: 'create' | 'edit'
  postId?: string
  initialValues?: BlogEditorValues
  cloudinaryConfigured: boolean
}

export function BlogEditor({ mode, postId, initialValues = EMPTY_BLOG_EDITOR_VALUES, cloudinaryConfigured }: BlogEditorProps) {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewUrl = useMemo(() => (postId ? `/admin/blog/${postId}/preview` : null), [postId])

  function updateValue<K extends keyof BlogEditorValues>(key: K, value: BlogEditorValues[K]) {
    setValues((c) => ({ ...c, [key]: value }))
    setFieldErrors((c) => { if (!c[key as string]) return c; const n = { ...c }; delete n[key as string]; return n })
  }

  function handleTitleChange(title: string) {
    updateValue('title', title)
    if (!slugTouched) updateValue('slug', slugifyBlogTitle(title))
  }

  function handleFeaturedImageChange(media: MediaFieldValue) {
    updateValue('featuredImageMediaId', media.mediaId)
    updateValue('featuredImage', media.url || '')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = mode === 'create'
        ? await createBlogPost(mapEditorValuesToCreateInput(values))
        : await updateBlogPost(mapEditorValuesToUpdateInput(postId!, values))

      if (applyFieldErrors(result, setFieldErrors)) return
      if (!result.success) { setFormError(result.error.message); return }

      router.push(`/admin/blog/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300" role="alert">{formError}</div>}

      <AdminCard as="section" aria-label="Post basics">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Title" name="title" error={fieldErrors.title}>
            <AdminTextInput id="title" value={values.title} hasError={Boolean(fieldErrors.title)} onChange={(e) => handleTitleChange(e.target.value)} required />
          </AdminField>
          <AdminField label="Slug" name="slug" error={fieldErrors.slug}>
            <AdminTextInput id="slug" value={values.slug} hasError={Boolean(fieldErrors.slug)} onChange={(e) => { setSlugTouched(true); updateValue('slug', e.target.value) }} required />
          </AdminField>
          <AdminField label="Status" name="status">
            <select id="status" value={values.status} onChange={(e) => updateValue('status', e.target.value as BlogEditorValues['status'])} className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </AdminField>
          <StringListField label="Tags" name="tags" values={values.tags} onChange={(tags) => updateValue('tags', tags.filter(Boolean))} placeholder="Add tag" />
        </div>
        <div className="mt-5">
          <AdminField label="Excerpt" name="excerpt" error={fieldErrors.excerpt}>
            <AdminTextarea id="excerpt" rows={3} value={values.excerpt} hasError={Boolean(fieldErrors.excerpt)} onChange={(e) => updateValue('excerpt', e.target.value)} required />
          </AdminField>
        </div>
      </AdminCard>

      <AdminCard as="section" aria-label="Content">
        <AdminField label="Content (Markdown)" name="content" error={fieldErrors.content} hint="Markdown supported — rendered in preview.">
          <AdminTextarea id="content" rows={16} value={values.content} hasError={Boolean(fieldErrors.content)} onChange={(e) => updateValue('content', e.target.value)} className="font-mono text-xs" required />
        </AdminField>
      </AdminCard>

      <AdminCard as="section" aria-label="Featured image">
        <MediaUploadField name="featuredImage" label="Featured image" folder="blog" value={{ mediaId: values.featuredImageMediaId, url: values.featuredImage }} onChange={handleFeaturedImageChange} cloudinaryConfigured={cloudinaryConfigured} error={fieldErrors.featuredImage ?? fieldErrors.featuredImageMediaId} />
      </AdminCard>

      <AdminCard as="section" aria-label="SEO">
        <div className="grid gap-5">
          <AdminField label="Meta title" name="metaTitle" error={fieldErrors.metaTitle}>
            <AdminTextInput id="metaTitle" value={values.metaTitle} onChange={(e) => updateValue('metaTitle', e.target.value)} />
          </AdminField>
          <AdminField label="Meta description" name="metaDescription" error={fieldErrors.metaDescription}>
            <AdminTextarea id="metaDescription" rows={3} value={values.metaDescription} onChange={(e) => updateValue('metaDescription', e.target.value)} />
          </AdminField>
        </div>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-5 text-sm font-medium text-white disabled:opacity-60">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create post' : 'Save changes'}
        </button>
        <Link href="/admin/blog" className="text-sm text-zinc-400 hover:text-white">Cancel</Link>
        {previewUrl && (
          <Link href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:text-primary-hover">Preview</Link>
        )}
      </div>
    </form>
  )
}
