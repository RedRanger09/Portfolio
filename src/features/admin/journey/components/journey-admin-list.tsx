'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Route } from 'lucide-react'
import { deleteJourneyMilestone, updateJourneyMilestone } from '@/features/portfolio/journey/actions'
import {
  AdminBadge,
  AdminCard,
  AdminConfirmDialog,
  AdminPagination,
  AdminSearchInput,
  ADMIN_PAGE_SIZE,
  EmptyState,
  SectionTitle,
  VisibilityToggleButton,
} from '@/features/admin/shared'
import type { AdminJourneyListItem } from '../types'

interface JourneyAdminListProps {
  milestones: AdminJourneyListItem[]
}

function JourneyRowActions({
  item,
  onDeleted,
  onOptimisticUpdate,
}: {
  item: AdminJourneyListItem
  onDeleted: (id: string) => void
  onOptimisticUpdate: (id: string, patch: Partial<AdminJourneyListItem>) => void
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function runToggleVisibility() {
    const previous = { isVisible: item.isVisible }
    onOptimisticUpdate(item.id, { isVisible: !item.isVisible })

    startTransition(async () => {
      const result = await updateJourneyMilestone({ id: item.id, isVisible: !previous.isVisible })
      if (!result.success) {
        onOptimisticUpdate(item.id, previous)
        return
      }
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteJourneyMilestone({ id: item.id })
      if (!result.success) return
      onDeleted(item.id)
      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      <VisibilityToggleButton
        isVisible={item.isVisible}
        disabled={isPending}
        onToggle={runToggleVisibility}
      />
      <button
        type="button"
        aria-expanded={menuOpen}
        disabled={isPending}
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {menuOpen && (
        <>
          <button type="button" className="fixed inset-0 z-10" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div role="menu" className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-white/[0.08] bg-surface py-1 shadow-card">
            <Link href={`/admin/journey/${item.id}`} role="menuitem" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <Link href="/#journey" target="_blank" rel="noopener noreferrer" role="menuitem" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]">
              <ExternalLink className="h-3.5 w-3.5" /> Preview
            </Link>
            <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-pink-400 hover:bg-pink-500/10" onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
      <AdminConfirmDialog open={deleteOpen} title="Delete milestone?" description={`"${item.label}" will be permanently removed.`} confirmLabel="Delete" loading={isPending} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  )
}

export function JourneyAdminList({ milestones: initialMilestones }: JourneyAdminListProps) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { setMilestones(initialMilestones) }, [initialMilestones])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return milestones
    return milestones.filter((m) => m.label.toLowerCase().includes(q) || m.year.toLowerCase().includes(q))
  }, [milestones, search])

  const totalPages = Math.max(1, Math.ceil(visible.length / ADMIN_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = visible.slice((currentPage - 1) * ADMIN_PAGE_SIZE, currentPage * ADMIN_PAGE_SIZE)

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Journey"
        description="Manage learning journey timeline milestones."
        action={
          <Link href="/admin/journey/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm font-medium text-white shadow-glow hover:bg-gradient-cta-hover">
            New milestone
          </Link>
        }
      />
      {milestones.length === 0 ? (
        <EmptyState icon={Route} title="No milestones yet" description="Create the first journey milestone." action={<Link href="/admin/journey/new" className="inline-flex min-h-10 items-center rounded-lg border border-primary/30 bg-gradient-cta px-4 text-sm text-white">Create milestone</Link>} />
      ) : (
        <>
          <AdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by label or year" />
          <AdminCard padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-5 py-3 text-xs uppercase text-zinc-500">Label</th>
                    <th className="px-5 py-3 text-xs uppercase text-zinc-500">Year</th>
                    <th className="px-5 py-3 text-xs uppercase text-zinc-500">Status</th>
                    <th className="px-5 py-3 text-xs uppercase text-zinc-500">Order</th>
                    <th className="px-5 py-3 text-right text-xs uppercase text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((item) => (
                    <tr key={item.id} className="border-b border-white/[0.06]">
                      <td className="px-5 py-4"><Link href={`/admin/journey/${item.id}`} className="font-medium text-white hover:text-primary">{item.label}</Link></td>
                      <td className="px-5 py-4 text-zinc-400">{item.year}</td>
                      <td className="px-5 py-4">{item.isCurrent ? <AdminBadge tone="info">Current</AdminBadge> : <AdminBadge tone="neutral">Past</AdminBadge>}</td>
                      <td className="px-5 py-4 text-zinc-400">{item.order}</td>
                      <td className="px-5 py-4">
                        <JourneyRowActions
                          item={item}
                          onDeleted={(id) => setMilestones((c) => c.filter((m) => m.id !== id))}
                          onOptimisticUpdate={(id, patch) => setMilestones((c) => c.map((m) => (m.id === id ? { ...m, ...patch } : m)))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/[0.08] px-5 py-4">
              <AdminPagination page={currentPage} totalPages={totalPages} totalItems={visible.length} onPageChange={setPage} />
            </div>
          </AdminCard>
        </>
      )}
    </div>
  )
}
