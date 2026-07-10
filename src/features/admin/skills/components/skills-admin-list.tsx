'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Code2, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { deleteSkillCategory } from '@/features/portfolio/skills/actions'
import { AdminBadge, AdminCard, AdminConfirmDialog, AdminPagination, AdminSearchInput, ADMIN_PAGE_SIZE, EmptyState, SectionTitle } from '@/features/admin/shared'
import type { AdminSkillCategoryListItem } from '../types'

export function SkillsAdminList({ categories: initial }: { categories: AdminSkillCategoryListItem[] }) {
  const [categories, setCategories] = useState(initial)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useEffect(() => { setCategories(initial) }, [initial])
  const visible = useMemo(() => { const q = search.trim().toLowerCase(); return q ? categories.filter((c) => c.title.toLowerCase().includes(q)) : categories }, [categories, search])
  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const paged = visible.slice((Math.min(page, totalPages) - 1) * ADMIN_PAGE_SIZE, Math.min(page, totalPages) * ADMIN_PAGE_SIZE)

  return (
    <div className="space-y-6">
      <SectionTitle title="Skills" description="Manage skill categories and technologies." action={<Link href="/admin/skills/new" className="inline-flex min-h-10 items-center rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm text-white">New category</Link>} />
      {categories.length === 0 ? <EmptyState icon={Code2} title="No skill categories" action={<Link href="/admin/skills/new" className="text-sm text-primary">Create category</Link>} /> : (
        <>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search categories" />
          <AdminCard padded={false}>
            <table className="w-full min-w-[40rem] text-sm"><thead><tr className="border-b border-white/[0.08]"><th className="px-5 py-3 text-xs uppercase text-zinc-500">Category</th><th className="px-5 py-3 text-xs uppercase text-zinc-500">Icon</th><th className="px-5 py-3 text-xs uppercase text-zinc-500">Technologies</th><th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Actions</th></tr></thead><tbody>
              {paged.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.06]">
                  <td className="px-5 py-4"><Link href={`/admin/skills/${item.id}`} className="font-medium text-white hover:text-primary">{item.title}</Link></td>
                  <td className="px-5 py-4 text-zinc-400">{item.icon}</td>
                  <td className="px-5 py-4"><AdminBadge tone="info">{item.itemCount} items</AdminBadge></td>
                  <td className="px-5 py-4 text-right"><button type="button" onClick={() => setMenuId(item.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08]"><MoreHorizontal className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody></table>
            <div className="border-t border-white/[0.08] px-5 py-4"><AdminPagination page={Math.min(page, totalPages)} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} /></div>
          </AdminCard>
        </>
      )}
      {menuId && (
        <div className="fixed right-8 top-1/3 z-20 w-40 rounded-lg border border-white/[0.08] bg-surface py-1 shadow-card">
          <Link href={`/admin/skills/${menuId}`} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300" onClick={() => setMenuId(null)}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
          <Link href="/#skills" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300" onClick={() => setMenuId(null)}><ExternalLink className="h-3.5 w-3.5" /> Preview</Link>
          <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-pink-400" onClick={() => { setDeleteId(menuId); setMenuId(null) }}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
        </div>
      )}
      <AdminConfirmDialog open={Boolean(deleteId)} title="Delete category?" description="All technologies in this category will be unlinked." loading={isPending} onConfirm={() => startTransition(async () => { if (!deleteId) return; const r = await deleteSkillCategory({ id: deleteId }); if (r.success) { setCategories((c) => c.filter((i) => i.id !== deleteId)); setDeleteId(null); router.refresh() } })} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
