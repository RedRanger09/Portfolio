'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { AdminBadge, AdminCard, AdminPagination, AdminSearchInput, AdminSelect, ADMIN_PAGE_SIZE, EmptyState, SectionTitle } from '@/features/admin/shared'
import type { AdminMediaListItem } from '@/features/media/data'
import type { MediaFolderKey } from '@/features/media/types'
import { getMediaFolderLabel, listMediaFolderKeys } from '@/features/media/lib/media-folders'
import { MediaDetailPanel, MediaUploadPanel } from './media-detail-panel'

interface MediaLibraryListProps {
  items: AdminMediaListItem[]
  cloudinaryConfigured: boolean
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibraryList({ items, cloudinaryConfigured }: MediaLibraryListProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [folderFilter, setFolderFilter] = useState<'all' | MediaFolderKey>('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const folderOptions = [{ value: 'all', label: 'All folders' }, ...listMediaFolderKeys().map((key) => ({ value: key, label: getMediaFolderLabel(key) }))]

  const visibleItems = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesFolder = folderFilter === 'all' || item.folderKey === folderFilter
      const matchesSearch = !normalized || item.folder.toLowerCase().includes(normalized) || item.publicId?.toLowerCase().includes(normalized) || item.altText?.toLowerCase().includes(normalized)
      return matchesFolder && matchesSearch
    })
  }, [items, search, folderFilter])

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = visibleItems.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE)
  const selected = items.find((item) => item.id === selectedId) ?? null

  return (
    <div className="space-y-6">
      <SectionTitle title="Media Library" description="Searchable asset library with upload, replace, delete, metadata, and usage tracking." />

      {!cloudinaryConfigured && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Cloudinary is not configured. Existing assets remain readable, but new uploads are disabled until CLOUDINARY_* environment variables are set.
        </div>
      )}

      <MediaUploadPanel cloudinaryConfigured={cloudinaryConfigured} onUploaded={() => router.refresh()} />

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media assets yet" description="Upload an image using the form above or from any CMS editor." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
              <AdminSearchInput value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search by folder, public ID, or alt text" />
              <AdminSelect label="Folder" value={folderFilter} onChange={(value) => { setFolderFilter(value as 'all' | MediaFolderKey); setPage(1) }} options={folderOptions} />
            </div>

            <AdminCard padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[48rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Preview</th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Folder</th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Metadata</th>
                      <th scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.map((item) => (
                      <tr key={item.id} className={`cursor-pointer border-b border-white/[0.06] last:border-b-0 ${selectedId === item.id ? 'bg-white/[0.04]' : ''}`} onClick={() => setSelectedId(item.id)}>
                        <td className="px-5 py-4">
                          <div className="relative h-14 w-24 overflow-hidden rounded-md border border-white/[0.08] bg-background/60">
                            <Image src={item.secureUrl ?? item.url} alt={item.altText ?? ''} fill className="object-cover" sizes="96px" unoptimized={item.url.startsWith('/')} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{item.folderKey ? getMediaFolderLabel(item.folderKey) : item.folder}</p>
                          <p className="text-xs text-zinc-500">{item.folder}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-zinc-400">
                          <p>{item.width && item.height ? `${item.width}×${item.height}` : '—'} · {item.format ?? '—'} · {formatBytes(item.bytes)}</p>
                          <p className="mt-1 truncate text-zinc-500">{item.altText || item.publicId || item.id}</p>
                        </td>
                        <td className="px-5 py-4">
                          <AdminBadge tone={item.referenceCount > 0 ? 'info' : 'neutral'}>
                            {item.referenceCount > 0 ? `${item.referenceCount} in use` : 'Unused'}
                          </AdminBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/[0.08] px-5 py-4">
                <AdminPagination page={currentPage} totalPages={totalPages} totalItems={visibleItems.length} onPageChange={setPage} />
              </div>
            </AdminCard>
          </div>

          {selected ? (
            <MediaDetailPanel item={selected} cloudinaryConfigured={cloudinaryConfigured} onClose={() => setSelectedId(null)} onUpdated={() => router.refresh()} />
          ) : (
            <AdminCard><p className="text-sm text-zinc-500">Select an asset to preview, edit metadata, replace, or delete.</p></AdminCard>
          )}
        </div>
      )}
    </div>
  )
}
