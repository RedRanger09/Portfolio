import type { LucideIcon } from 'lucide-react'
import type { AccentColor } from '@/shared/types'
import { ACCENT_CLASSES } from '@/constants/theme'
import { AdminCard } from './admin-card'

interface StatCardProps {
  label: string
  /** A placeholder value (e.g. `'—'`) is expected until a module wires up real counts — see `dashboard/admin-dashboard-overview.tsx`. */
  value: string | number
  icon?: LucideIcon
  accent?: AccentColor
  hint?: string
}

/** A single metric tile for the dashboard overview grid — reuses the public site's `AccentColor` tokens, not a new admin palette. */
export function StatCard({ label, value, icon: Icon, accent = 'cyan', hint }: StatCardProps) {
  const accentClasses = ACCENT_CLASSES[accent]

  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${accentClasses.border} ${accentClasses.bg}`}>
            <Icon className={`h-4 w-4 ${accentClasses.text}`} aria-hidden="true" />
          </span>
        )}
      </div>
    </AdminCard>
  )
}
