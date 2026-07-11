'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, MoreHorizontal, Pencil, Star, Trash2, Eye, EyeOff } from 'lucide-react'
import { deleteProject, duplicateProject, updateProject } from '@/features/portfolio/projects/actions'
import { AdminConfirmDialog, VisibilityToggleButton } from '@/features/admin/shared'
import { cn } from '@/shared/utils'
import type { AdminProjectListItem } from '../types'

interface ProjectRowActionsProps {
  project: AdminProjectListItem
  onOptimisticUpdate: (id: string, patch: Partial<AdminProjectListItem>) => void
}

export function ProjectRowActions({ project, onOptimisticUpdate }: ProjectRowActionsProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function runToggle(field: 'featured' | 'published' | 'isVisible') {
    setActionError(null)
    const previous = {
      featured: project.featured,
      published: project.published,
      isPlaceholder: project.isPlaceholder,
      isVisible: project.isVisible,
    }

    if (field === 'featured') {
      onOptimisticUpdate(project.id, { featured: !project.featured })
    } else if (field === 'published') {
      const nextPublished = !project.published
      onOptimisticUpdate(project.id, { published: nextPublished, isPlaceholder: !nextPublished })
    } else {
      onOptimisticUpdate(project.id, { isVisible: !project.isVisible })
    }

    startTransition(async () => {
      const result =
        field === 'featured'
          ? await updateProject({ id: project.id, featured: !previous.featured })
          : field === 'published'
            ? await updateProject({ id: project.id, isPlaceholder: !previous.published })
            : await updateProject({ id: project.id, isVisible: !previous.isVisible })

      if (!result.success) {
        onOptimisticUpdate(project.id, previous)
        setActionError(result.error.message)
        return
      }

      router.refresh()
    })
  }

  function handleDuplicate() {
    setMenuOpen(false)
    setActionError(null)

    startTransition(async () => {
      const result = await duplicateProject({ id: project.id })
      if (!result.success) {
        setActionError(result.error.message)
        return
      }

      router.push(`/admin/projects/${result.data.id}`)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProject({ id: project.id })
      if (!result.success) {
        setActionError(result.error.message)
        return
      }

      setDeleteOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center justify-end gap-1">
      {actionError && (
        <span className="sr-only" role="alert">
          {actionError}
        </span>
      )}

      <button
        type="button"
        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
        aria-pressed={project.featured}
        disabled={isPending}
        onClick={() => runToggle('featured')}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50',
          project.featured ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-white',
        )}
      >
        <Star className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">{project.featured ? 'Unfeature' : 'Feature'}</span>
      </button>

      <button
        type="button"
        title={project.published ? 'Unpublish' : 'Publish'}
        aria-pressed={project.published}
        disabled={isPending}
        onClick={() => runToggle('published')}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50',
          project.published ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-white',
        )}
      >
        {project.published ? <Eye className="h-3.5 w-3.5" aria-hidden="true" /> : <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />}
        <span className="sr-only">{project.published ? 'Unpublish' : 'Publish'}</span>
      </button>

      <VisibilityToggleButton
        isVisible={project.isVisible}
        disabled={isPending}
        onToggle={() => runToggle('isVisible')}
      />

      <div className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={isPending}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-500 transition hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">More actions</span>
        </button>

        {menuOpen && (
          <>
            <button type="button" className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            <div role="menu" className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-white/[0.08] bg-surface py-1 shadow-card">
              <Link
                href={`/admin/projects/${project.id}`}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Link>

              {project.published ? (
                <Link
                  href={`/projects/${project.slug}`}
                  role="menuitem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview
                </Link>
              ) : (
                <span role="menuitem" aria-disabled="true" className="flex cursor-not-allowed items-center gap-2 px-3 py-2 text-sm text-zinc-600">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview (publish first)
                </span>
              )}

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                onClick={handleDuplicate}
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Duplicate
              </button>

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-pink-400 hover:bg-pink-500/10"
                onClick={() => {
                  setMenuOpen(false)
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <AdminConfirmDialog
        open={deleteOpen}
        title="Delete project?"
        description={`"${project.name}" will be permanently removed from the portfolio. This cannot be undone.`}
        confirmLabel="Delete project"
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
