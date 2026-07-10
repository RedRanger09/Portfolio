import type { LucideIcon } from 'lucide-react'
import { SectionTitle } from './section-title'
import { EmptyState } from './empty-state'
import { AdminTableShell } from './admin-table-shell'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  /**
   * Column headers for a structural preview of the future data table.
   * Pass this for list-shaped modules (Projects, Skills, ...); omit it
   * for singleton-shaped ones (Hero, Resume, Settings, ...) where a
   * table doesn't make sense and `EmptyState` alone is the right shape.
   */
  previewColumns?: string[]
}

/**
 * The one placeholder every `/admin/<module>/page.tsx` in this phase
 * renders — shared so all fifteen module pages stay a few lines each and
 * so the wording/shape of "this isn't built yet" only has one definition
 * to update. Not used by `/admin` itself, which has real (if inert)
 * dashboard content instead — see `AdminDashboardOverview`.
 */
export function ModulePlaceholder({ title, description, icon, previewColumns }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <SectionTitle title={title} description={description} />
      {previewColumns ? (
        <AdminTableShell columns={previewColumns} emptyMessage="This module hasn't been implemented yet." />
      ) : (
        <EmptyState
          icon={icon}
          title="Not implemented yet"
          description="This module is part of the Admin Foundation — its content and actions arrive in a later phase."
        />
      )}
    </div>
  )
}
