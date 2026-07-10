'use client'

import { cn } from '@/shared/utils'

export const ADMIN_PAGE_SIZE = 10

interface AdminPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize?: number
  onPageChange: (page: number) => void
}

/** Client-side pagination chrome — ready for server-driven paging later. */
export function AdminPagination({ page, totalPages, totalItems, pageSize = ADMIN_PAGE_SIZE, onPageChange }: AdminPaginationProps) {
  if (totalItems === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2 text-xs text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex min-h-9 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

interface AdminSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}

export function AdminSelect({ label, value, onChange, options, className }: AdminSelectProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/[0.08] bg-background px-3 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-background text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
