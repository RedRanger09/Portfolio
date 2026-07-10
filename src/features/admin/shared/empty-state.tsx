import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AdminCard } from './admin-card'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** e.g. a future "Back to dashboard" link — plain `ReactNode`, not a button primitive, since none exists yet. */
  action?: ReactNode
}

/**
 * The "nothing here yet" surface — used today by every module's route
 * page (`app/admin/*\/page.tsx`) to explain the module hasn't been built,
 * and reusable later for genuinely empty data states (e.g. "No projects
 * yet") once CRUD exists. Same component, two different captions.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <AdminCard padded={false} className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03]">
          <Icon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
        </span>
      )}
      <h2 className="text-sm font-medium text-white">{title}</h2>
      {description && <p className="max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </AdminCard>
  )
}
