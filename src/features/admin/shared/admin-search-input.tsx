'use client'

import { Search } from 'lucide-react'
import { cn } from '@/shared/utils'

interface AdminSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Reusable search field for admin list pages. */
export function AdminSearchInput({ value, onChange, placeholder = 'Search…', className }: AdminSearchInputProps) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.08] bg-background py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      />
    </label>
  )
}
