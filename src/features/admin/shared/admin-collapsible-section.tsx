'use client'

import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { AdminCard } from './admin-card'
import { cn } from '@/shared/utils'

interface AdminCollapsibleSectionProps {
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
  /** Optional control rendered in the header (e.g. visibility toggle). */
  headerAction?: ReactNode
}

/** Collapsible CMS card — keeps long project editors scannable without losing section context. */
export function AdminCollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  headerAction,
}: AdminCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <AdminCard as="section" aria-label={title} padded={false}>
      <div className="flex items-start gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <ChevronDown
            className={cn('mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-white">{title}</span>
            {description ? <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span> : null}
          </span>
        </button>
        {headerAction ? <div className="shrink-0 pt-0.5">{headerAction}</div> : null}
      </div>
      {open ? (
        <div id={panelId} className="px-5 py-5 sm:px-6">
          {children}
        </div>
      ) : null}
    </AdminCard>
  )
}
