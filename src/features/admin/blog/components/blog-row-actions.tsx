'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteBlogPost, updateBlogPost } from '@/features/blog/actions'
import { AdminConfirmDialog, VisibilityToggleButton } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { AdminBlogListItem } from '../types'

interface BlogRowActionsProps {
  post: AdminBlogListItem
  onOptimisticUpdate: (id: string, patch: Partial<AdminBlogListItem>) => void
}

export function BlogRowActions({ post, onOptimisticUpdate }: BlogRowActionsProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function runTogglePublish() {
    const nextStatus = post.published ? 'DRAFT' : 'PUBLISHED'
    const previous = { status: post.status, published: post.published }
    onOptimisticUpdate(post.id, { status: nextStatus, published: !post.published })

    startTransition(async () => {
      const result = await updateBlogPost({ id: post.id, status: nextStatus })
      if (!result.success) {
        onOptimisticUpdate(post.id, previous)
        return
      }
      router.refresh()
    })
  }

  function runToggleVisibility() {
    const previous = { isVisible: post.isVisible }
    onOptimisticUpdate(post.id, { isVisible: !post.isVisible })

    startTransition(async () => {
      const result = await updateBlogPost({ id: post.id, isVisible: !previous.isVisible })
      if (!result.success) {
        onOptimisticUpdate(post.id, previous)
        return
      }
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteBlogPost({ id: post.id })
      if (!result.success) return
      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        type="button"
        title={post.published ? 'Unpublish' : 'Publish'}
        disabled={isPending}
        onClick={runTogglePublish}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50',
          post.published ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-white',
        )}
      >
        {post.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        <span className="sr-only">{post.published ? 'Unpublish' : 'Publish'}</span>
      </button>

      <VisibilityToggleButton
        isVisible={post.isVisible}
        disabled={isPending}
        onToggle={runToggleVisibility}
      />

      <div className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          disabled={isPending}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 transition hover:border-white/20 hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More actions</span>
        </button>

        {menuOpen && (
          <>
            <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            <div role="menu" className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-white/[0.08] bg-surface py-1 shadow-card">
              <Link href={`/admin/blog/${post.id}`} role="menuitem" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white" onClick={() => setMenuOpen(false)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
              <Link href={`/admin/blog/${post.id}/preview`} role="menuitem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white" onClick={() => setMenuOpen(false)}>
                <ExternalLink className="h-3.5 w-3.5" />
                Preview
              </Link>
              <button type="button" role="menuitem" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-pink-400 hover:bg-pink-500/10" onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <AdminConfirmDialog open={deleteOpen} title="Delete post?" description={`"${post.title}" will be permanently removed.`} confirmLabel="Delete post" loading={isPending} onConfirm={handleDelete} onCancel={() => setDeleteOpen(false)} />
    </div>
  )
}
