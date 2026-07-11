'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { deleteCertification, updateCertification } from '@/features/portfolio/certifications/actions'
import { AdminCard, AdminConfirmDialog, AdminPagination, AdminSearchInput, ADMIN_PAGE_SIZE, EmptyState, SectionTitle, VisibilityToggleButton } from '@/features/admin/shared'
import type { AdminCertificationListItem } from '../types'

export function CertificationsAdminList({ items: initial }: { items: AdminCertificationListItem[] }) {
  const [items, setItems] = useState(initial)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useEffect(() => { setItems(initial) }, [initial])
  const visible = useMemo(() => { const q = search.trim().toLowerCase(); return q ? items.filter((i) => i.name.toLowerCase().includes(q) || i.provider.toLowerCase().includes(q)) : items }, [items, search])
  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const paged = visible.slice((Math.min(page, totalPages) - 1) * ADMIN_PAGE_SIZE, Math.min(page, totalPages) * ADMIN_PAGE_SIZE)

  function runToggleVisibility(item: AdminCertificationListItem) {
    const previous = { isVisible: item.isVisible }
    setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, isVisible: !item.isVisible } : i)))
    startTransition(async () => {
      const result = await updateCertification({ id: item.id, isVisible: !previous.isVisible })
      if (!result.success) {
        setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, ...previous } : i)))
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Certificates" description="Manage certification cards." action={<Link href="/admin/certifications/new" className="inline-flex min-h-10 items-center rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm text-white">New certificate</Link>} />
      {items.length === 0 ? <EmptyState icon={Award} title="No certificates" action={<Link href="/admin/certifications/new" className="text-sm text-primary">Add certificate</Link>} /> : (
        <>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search name or provider" />
          <AdminCard padded={false}>
            <table className="w-full min-w-[40rem] text-sm"><thead><tr className="border-b border-white/[0.08]"><th className="px-5 py-3 text-xs uppercase text-zinc-500">Certificate</th><th className="px-5 py-3 text-xs uppercase text-zinc-500">Provider</th><th className="px-5 py-3 text-xs uppercase text-zinc-500">Date</th><th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Actions</th></tr></thead><tbody>
              {paged.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.06]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="relative h-10 w-16 overflow-hidden rounded border border-white/[0.08]"><Image src={item.image} alt="" fill className="object-cover" unoptimized={item.image.startsWith('/')} /></div><Link href={`/admin/certifications/${item.id}`} className="font-medium text-white hover:text-primary">{item.name}</Link></div></td>
                  <td className="px-5 py-4 text-zinc-400">{item.provider}</td><td className="px-5 py-4 text-zinc-400">{item.completionDate || '—'}</td>
                  <td className="px-5 py-4 text-right"><div className="inline-flex items-center justify-end gap-1"><VisibilityToggleButton isVisible={item.isVisible} disabled={isPending} onToggle={() => runToggleVisibility(item)} /><button type="button" onClick={() => setMenuId(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08]"><MoreHorizontal className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody></table>
            <div className="border-t border-white/[0.08] px-5 py-4"><AdminPagination page={Math.min(page, totalPages)} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} /></div>
          </AdminCard>
        </>
      )}
      {menuId && (
        <>
          <button type="button" className="fixed inset-0 z-10" onClick={() => setMenuId(null)} aria-label="Close" />
          <div className="fixed right-8 top-1/2 z-20 w-40 rounded-lg border border-white/[0.08] bg-surface py-1 shadow-card">
            <Link href={`/admin/certifications/${menuId}`} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
            <Link href="/#certifications" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300"><ExternalLink className="h-3.5 w-3.5" /> Preview</Link>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-pink-400" onClick={() => { setDeleteId(menuId); setMenuId(null) }}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </>
      )}
      <AdminConfirmDialog open={Boolean(deleteId)} title="Delete certificate?" description="This cannot be undone." loading={isPending} onConfirm={() => startTransition(async () => { if (!deleteId) return; const r = await deleteCertification({ id: deleteId }); if (r.success) { setItems((c) => c.filter((i) => i.id !== deleteId)); setDeleteId(null); router.refresh() } })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
