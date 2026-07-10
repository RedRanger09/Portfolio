'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from 'lucide-react'
import {
  addProjectGalleryImage,
  removeProjectGalleryItem,
  reorderProjectGallery,
  replaceProjectGalleryImage,
  updateProjectGalleryItem,
} from '@/features/portfolio/projects/actions'
import { AdminCard, AdminConfirmDialog, AdminField, AdminTextInput } from '@/features/admin/shared'
import type { MediaGalleryItem } from '@/features/media/types'
import { cn } from '@/shared/utils'

interface ProjectGalleryEditorProps {
  projectId: string
  initialItems: MediaGalleryItem[]
  cloudinaryConfigured: boolean
  /** When true, omit the outer AdminCard — parent supplies section chrome. */
  embedded?: boolean
}

export function ProjectGalleryEditor({ projectId, initialItems, cloudinaryConfigured, embedded = false }: ProjectGalleryEditorProps) {
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const uploadRef = useRef<HTMLInputElement>(null)
  const replaceRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  function applyResult(result: { success: true; data: MediaGalleryItem[] } | { success: false; error: { message: string } }) {
    if (!result.success) {
      setError(result.error.message)
      return
    }
    setError(null)
    setItems(result.data)
  }

  function handleUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    startTransition(async () => {
      applyResult(await addProjectGalleryImage(formData))
    })
  }

  function handleReplace(attachmentId: string, file: File) {
    const item = items.find((entry) => entry.attachmentId === attachmentId)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('attachmentId', attachmentId)
    if (item?.caption) formData.append('caption', item.caption)
    if (item?.altText) formData.append('altText', item.altText)

    startTransition(async () => {
      applyResult(await replaceProjectGalleryImage(formData))
    })
  }

  function saveMetadata(attachmentId: string, caption: string, altText: string) {
    startTransition(async () => {
      applyResult(
        await updateProjectGalleryItem({
          projectId,
          attachmentId,
          caption,
          altText,
        }),
      )
    })
  }

  function moveItem(attachmentId: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.attachmentId === attachmentId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return

    const next = [...items]
    const [moved] = next.splice(index, 1)
    if (!moved) return
    next.splice(nextIndex, 0, moved)
    setItems(next)

    startTransition(async () => {
      applyResult(
        await reorderProjectGallery({
          projectId,
          attachmentIds: next.map((item) => item.attachmentId),
        }),
      )
    })
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      applyResult(await removeProjectGalleryItem({ projectId, attachmentId: deleteId }))
      setDeleteId(null)
    })
  }

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {!embedded ? (
          <div>
            <h2 className="text-sm font-medium text-white">Screenshot Gallery</h2>
            <p className="mt-1 text-xs text-zinc-500">Unlimited screenshots for the public case study. Order is preserved on the live page.</p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Unlimited screenshots for the public case study. Order is preserved on the live page.</p>
        )}
        <div>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) handleUpload(file)
              event.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={!cloudinaryConfigured || isPending}
            onClick={() => uploadRef.current?.click()}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload screenshot
          </button>
        </div>
      </div>

      {!cloudinaryConfigured && (
        <p className="mt-3 text-sm text-amber-300">Cloudinary is not configured — gallery uploads are disabled.</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-pink-300" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">No screenshots yet. Upload the first image to build this project&apos;s gallery.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item, index) => (
            <li key={item.attachmentId} className="rounded-xl border border-white/[0.08] bg-background/40 p-4">
              <div className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.08]">
                  <Image src={item.src} alt={item.altText || item.caption || 'Screenshot'} fill className="object-cover" sizes="160px" unoptimized={item.src.startsWith('/')} />
                </div>

                <div className="space-y-3">
                  <GalleryMetadataFields
                    item={item}
                    disabled={isPending}
                    onSave={(caption, altText) => saveMetadata(item.attachmentId, caption, altText)}
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isPending || index === 0}
                      onClick={() => moveItem(item.attachmentId, -1)}
                      className={cn('inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-zinc-300 disabled:opacity-40')}
                    >
                      <ArrowUp className="h-3.5 w-3.5" /> Move up
                    </button>
                    <button
                      type="button"
                      disabled={isPending || index === items.length - 1}
                      onClick={() => moveItem(item.attachmentId, 1)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
                    >
                      <ArrowDown className="h-3.5 w-3.5" /> Move down
                    </button>
                    <input
                      ref={(node) => {
                        replaceRefs.current[item.attachmentId] = node
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) handleReplace(item.attachmentId, file)
                        event.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      disabled={!cloudinaryConfigured || isPending}
                      onClick={() => replaceRefs.current[item.attachmentId]?.click()}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
                    >
                      <Upload className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setDeleteId(item.attachmentId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-pink-500/30 px-2.5 py-1.5 text-xs text-pink-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminConfirmDialog
        open={Boolean(deleteId)}
        title="Delete screenshot?"
        description="This removes the screenshot from the project gallery. Unused media is soft-deleted."
        confirmLabel="Delete"
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )

  if (embedded) return content

  return (
    <AdminCard as="section" aria-label="Screenshot gallery">
      {content}
    </AdminCard>
  )
}

function GalleryMetadataFields({
  item,
  disabled,
  onSave,
}: {
  item: MediaGalleryItem
  disabled: boolean
  onSave: (caption: string, altText: string) => void
}) {
  const [caption, setCaption] = useState(item.caption)
  const [altText, setAltText] = useState(item.altText)

  useEffect(() => {
    setCaption(item.caption)
    setAltText(item.altText)
  }, [item.attachmentId, item.caption, item.altText])

  const dirty = caption !== item.caption || altText !== item.altText

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminField label="Caption" name={`caption-${item.attachmentId}`}>
        <AdminTextInput
          id={`caption-${item.attachmentId}`}
          value={caption}
          disabled={disabled}
          onChange={(event) => setCaption(event.target.value)}
          onBlur={() => {
            if (dirty) onSave(caption, altText)
          }}
        />
      </AdminField>
      <AdminField label="Alt text" name={`alt-${item.attachmentId}`}>
        <AdminTextInput
          id={`alt-${item.attachmentId}`}
          value={altText}
          disabled={disabled}
          onChange={(event) => setAltText(event.target.value)}
          onBlur={() => {
            if (dirty) onSave(caption, altText)
          }}
        />
      </AdminField>
    </div>
  )
}
