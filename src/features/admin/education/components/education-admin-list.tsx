'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { deleteEducation } from '@/features/portfolio/education/actions'
import { AdminBadge, AdminCard, AdminConfirmDialog, AdminPagination, AdminSearchInput, ADMIN_PAGE_SIZE, EmptyState, SectionTitle } from '@/features/admin/shared'
import type { AdminEducationListItem } from '../types'

function RowActions({ item, onDeleted }: { item: AdminEducationListItem; onDeleted: (id: string) => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  return (
    <div className="relative flex justify-end">
      <button type="button" onClick={() => setOpen(!open)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500"><MoreHorizontal className="h-4 w-4" /></button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-white/[0.08] bg-surface py-1">
            <Link href={`/admin/education/${item.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
            <Link href="/#education" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]"><ExternalLink className="h-3.5 w-3.5" /> Preview</Link>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-pink-400" onClick={() => { setOpen(false); setDeleteOpen(true) }}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
          </div>
        </>
      )}
      <AdminConfirmDialog open={deleteOpen} title="Delete entry?" description={`Remove "${item.institution}"?`} loading={isPending} onConfirm={() => startTransition(async () => { const r = await deleteEducation({ id: item.id }); if (r.success) { onDeleted(item.id); setDeleteOpen(false); router.refresh() } })} onCancel={() => setDeleteOpen(false)} />
    </div>
  )
}

export function EducationAdminList({ entries: initial }: { entries: AdminEducationListItem[] }) {
  const [entries, setEntries] = useState(initial)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  useEffect(() => { setEntries(initial) }, [initial])
  const visible = useMemo(() => { const q = search.trim().toLowerCase(); return q ? entries.filter((e) => e.institution.toLowerCase().includes(q) || e.degree.toLowerCase().includes(q)) : entries }, [entries, search])
  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const paged = visible.slice((Math.min(page, totalPages) - 1) * ADMIN_PAGE_SIZE, Math.min(page, totalPages) * ADMIN_PAGE_SIZE)
  return (
    <div className="space-y-6">
      <SectionTitle title="Education" description="Manage education timeline entries." action={<Link href="/admin/education/new" className="inline-flex min-h-10 items-center rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm text-white">New entry</Link>} />
      {entries.length === 0 ? <EmptyState icon={GraduationCap} title="No education entries" action={<Link href="/admin/education/new" className="text-sm text-primary">Create entry</Link>} /> : (
        <>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search institution or degree" />
          <AdminCard padded={false}>
            <table className="w-full min-w-[40rem] text-sm"><thead><tr className="border-b border-white/[0.08]"><th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Institution</th><th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Type</th><th className="px-5 py-3 text-left text-xs uppercase text-zinc-500">Period</th><th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Actions</th></tr></thead><tbody>
              {paged.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.06]"><td className="px-5 py-4"><Link href={`/admin/education/${item.id}`} className="font-medium text-white hover:text-primary">{item.institution}</Link><p className="text-xs text-zinc-500">{item.degree}</p></td><td className="px-5 py-4"><AdminBadge>{item.type}</AdminBadge></td><td className="px-5 py-4 text-zinc-400">{item.period}</td><td className="px-5 py-4"><RowActions item={item} onDeleted={(id) => setEntries((c) => c.filter((e) => e.id !== id))} /></td></tr>
              ))}
            </tbody></table>
            <div className="border-t border-white/[0.08] px-5 py-4"><AdminPagination page={Math.min(page, totalPages)} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} /></div>
          </AdminCard>
        </>
      )}
    </div>
  )
}
