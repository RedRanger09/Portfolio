import type { ReactNode } from 'react'
import { cn } from '@/shared/utils'

interface AdminCardProps {
  children: ReactNode
  className?: string
  /** Renders as a `<section>` with `aria-label` instead of a plain `<div>` — use for a self-contained dashboard region. */
  as?: 'div' | 'section'
  'aria-label'?: string
  /**
   * Set `false` when a consumer (e.g. `AdminTableShell`) needs full
   * control of its own internal spacing. A plain `className` override
   * can't reliably win against the default padding here — this
   * codebase's `cn()` (`@/shared/utils`) is a naive class-joiner, not
   * `tailwind-merge`, so it doesn't dedupe conflicting utilities and
   * Tailwind's own cascade order (not className order) would decide the
   * winner. An explicit prop sidesteps that entirely.
   */
  padded?: boolean
}

/**
 * The one bordered-surface primitive every admin module composes with —
 * the dashboard's equivalent of the public site's inlined
 * `rounded-2xl border border-white/[0.08] bg-surface/60` card pattern
 * (`ProjectCard`, `ContactMethodCard`), pulled into a real shared
 * component now that 3+ admin pieces (`StatCard`, `AdminTableShell`,
 * every module placeholder) need the identical surface.
 */
export function AdminCard({ children, className, as = 'div', 'aria-label': ariaLabel, padded = true }: AdminCardProps) {
  const Tag = as
  return (
    <Tag
      aria-label={ariaLabel}
      className={cn('rounded-xl border border-white/[0.08] bg-surface/70', padded && 'p-5 sm:p-6', className)}
    >
      {children}
    </Tag>
  )
}
