import type { ReactNode } from 'react'

interface SectionTitleProps {
  title: string
  description?: string
  /** Right-aligned slot for a future per-module action (e.g. "New project") — unused by this phase's placeholder pages. */
  action?: ReactNode
}

/** Page-level heading used at the top of every admin module — the dashboard's counterpart to the public site's `SectionHeader`. */
export function SectionTitle({ title, description, action }: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-zinc-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
