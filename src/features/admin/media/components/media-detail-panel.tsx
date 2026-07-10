'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { deleteMedia, replaceMedia, uploadMedia, updateMediaMetadataAction } from '@/features/media/actions'
import { AdminBadge, AdminCard, AdminConfirmDialog, AdminField, AdminTextInput } from '@/features/admin/shared'
import type { AdminMediaListItem } from '@/features/media/data'
import type { MediaFolderKey } from '@/features/media/types'
import { getMediaFolderLabel, listMediaFolderKeys } from '@/features/media/lib/media-folders'

interface MediaDetailPanelProps {
  item: AdminMediaListItem
  cloudinaryConfigured: boolean
  onClose: () => void
  onUpdated: () => void
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaDetailPanel({ item, cloudinaryConfigured, onClose, onUpdated }: MediaDetailPanelProps) {
  const [altText, setAltText] = useState(item.altText ?? '')
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const replaceInputRef = useRef<HTMLInputElement>(null)

  function saveMetadata() {
    setError(null)
    startTransition(async () => {
      const result = await updateMediaMetadataAction({ id: item.id, altText: altText || null })
      if (!result.success) { setError(result.error.message); return }
      onUpdated()
    })
  }

  function handleReplace(file: File) {
    if (!item.folderKey) return
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaId', item.id)
    formData.append('folder', item.folderKey)
    formData.append('altText', altText)

    startTransition(async () => {
      const result = await replaceMedia(formData)
      if (!result.success) { setError(result.error.message); return }
      onUpdated()
      onClose()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMedia({ id: item.id })
      if (!result.success) { setError(result.error.message); return }
      setDeleteOpen(false)
      onUpdated()
      onClose()
    })
  }

  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Media details</h2>
          <p className="text-xs text-zinc-500">{item.folderKey ? getMediaFolderLabel(item.folderKey) : item.folder}</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-zinc-400 hover:text-white">Close</button>
      </div>

      {error && <p className="mt-3 text-sm text-pink-300" role="alert">{error}</p>}

      <div className="relative mt-4 aspect-video overflow-hidden rounded-lg border border-white/[0.08] bg-background/60">
        <Image src={item.secureUrl ?? item.url} alt={altText} fill className="object-contain" sizes="(max-width: 768px) 100vw, 480px" unoptimized={item.url.startsWith('/')} />
      </div>

      <dl className="mt-4 grid gap-2 text-xs text-zinc-400">
        <div className="flex justify-between gap-3"><dt>Dimensions</dt><dd>{item.width && item.height ? `${item.width}×${item.height}` : '—'}</dd></div>
        <div className="flex justify-between gap-3"><dt>Format</dt><dd>{item.format ?? '—'}</dd></div>
        <div className="flex justify-between gap-3"><dt>Size</dt><dd>{formatBytes(item.bytes)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Public ID</dt><dd className="truncate text-right">{item.publicId ?? item.id}</dd></div>
      </dl>

      <div className="mt-4">
        <AdminField label="Alt text" name="altText">
          <AdminTextInput id="altText" value={altText} onChange={(e) => setAltText(e.target.value)} />
        </AdminField>
        <button type="button" disabled={isPending} onClick={saveMetadata} className="mt-3 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20">Save metadata</button>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-white">Usage</p>
        {item.usage.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">Unused</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {item.usage.map((ref) => (
              <li key={`${ref.type}-${ref.label}`} className="text-xs text-zinc-400">{ref.type}: {ref.label}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleReplace(file) }} />
        <button type="button" disabled={!cloudinaryConfigured || isPending} onClick={() => replaceInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 disabled:opacity-50">
          <Upload className="h-3.5 w-3.5" /> Replace
        </button>
        <button type="button" disabled={isPending || item.referenceCount > 0} onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-pink-500/30 px-3 py-1.5 text-xs text-pink-300 hover:border-pink-500/50 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        {item.referenceCount > 0 && <AdminBadge tone="info">{item.referenceCount} in use</AdminBadge>}
      </div>

      <AdminConfirmDialog open={deleteOpen} title="Delete media?" description="This asset will be soft-deleted from the library." confirmLabel="Delete" loading={isPending} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </AdminCard>
  )
}

interface MediaUploadPanelProps {
  cloudinaryConfigured: boolean
  onUploaded: () => void
}

export function MediaUploadPanel({ cloudinaryConfigured, onUploaded }: MediaUploadPanelProps) {
  const [folder, setFolder] = useState<MediaFolderKey>('projects')
  const [altText, setAltText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleUpload(file: File) {
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    if (altText) formData.append('altText', altText)

    startTransition(async () => {
      const result = await uploadMedia(formData)
      if (!result.success) { setError(result.error.message); return }
      setAltText('')
      onUploaded()
    })
  }

  return (
    <AdminCard>
      <h2 className="text-sm font-medium text-white">Upload asset</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
        <label className="block text-xs text-zinc-400">
          Folder
          <select value={folder} onChange={(e) => setFolder(e.target.value as MediaFolderKey)} className="mt-1 w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white">
            {listMediaFolderKeys().map((key) => <option key={key} value={key}>{getMediaFolderLabel(key)}</option>)}
          </select>
        </label>
        <AdminField label="Alt text (optional)" name="uploadAltText">
          <AdminTextInput id="uploadAltText" value={altText} onChange={(e) => setAltText(e.target.value)} />
        </AdminField>
        <div className="flex items-end">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file) }} />
          <button type="button" disabled={!cloudinaryConfigured || isPending} onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-4 text-sm font-medium text-white disabled:opacity-60">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-pink-300" role="alert">{error}</p>}
    </AdminCard>
  )
}
