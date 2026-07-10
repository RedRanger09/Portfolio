'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { replaceMedia, uploadMedia } from '@/features/media/actions'
import type { MediaFieldValue, MediaFolderKey } from '@/features/media/types'
import { AdminField } from '@/features/admin/shared'
import { cn } from '@/shared/utils'

interface MediaUploadFieldProps {
  label: string
  name: string
  folder: MediaFolderKey
  value: MediaFieldValue
  onChange: (value: MediaFieldValue) => void
  error?: string
  hint?: string
  cloudinaryConfigured: boolean
  fallbackPreviewUrl?: string
}

/** Reusable CMS image upload field — upload, preview, replace, and remove. */
export function MediaUploadField({
  label,
  name,
  folder,
  value,
  onChange,
  error,
  hint,
  cloudinaryConfigured,
  fallbackPreviewUrl,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const previewUrl = value.url || fallbackPreviewUrl || ''

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setActionError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      if (value.altText) {
        formData.append('altText', value.altText)
      }

      let result

      if (value.mediaId) {
        formData.append('mediaId', value.mediaId)
        result = await replaceMedia(formData)
      } else {
        result = await uploadMedia(formData)
      }

      if (!result.success) {
        setActionError(result.error.message)
        return
      }

      onChange({
        mediaId: result.data.id,
        url: result.data.secureUrl ?? result.data.url,
        altText: result.data.altText ?? undefined,
      })
    })
  }

  function handleRemove() {
    setActionError(null)
    onChange({ mediaId: null, url: '', altText: undefined })
  }

  return (
    <AdminField label={label} name={name} error={error ?? actionError ?? undefined} hint={hint}>
      <div className="space-y-3">
        {previewUrl ? (
          <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-background/60">
            <Image
              src={previewUrl}
              alt={value.altText ?? ''}
              width={640}
              height={360}
              className="h-40 w-full object-cover"
              unoptimized={previewUrl.startsWith('/')}
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-background/40 text-sm text-zinc-500">
            No image selected
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={!cloudinaryConfigured || isPending}
            className={cn(
              'inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50',
              cloudinaryConfigured
                ? 'border-primary/30 bg-primary/10 text-white hover:border-primary/50'
                : 'border-white/[0.08] text-zinc-500',
            )}
          >
            {isPending ? <Loader2 className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" /> : previewUrl ? <Upload className="h-4 w-4" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
            {previewUrl ? 'Replace image' : 'Upload image'}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-sm font-medium text-zinc-300 transition hover:border-pink-500/30 hover:text-pink-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>

        {!cloudinaryConfigured && (
          <p className="text-xs text-amber-400/90">Cloudinary is not configured. Set CLOUDINARY_* variables to enable uploads. Existing image paths still preview when present.</p>
        )}

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="sr-only" onChange={handleFileSelected} />
      </div>
    </AdminField>
  )
}
