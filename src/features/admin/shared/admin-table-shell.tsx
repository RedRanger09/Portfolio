import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { AdminCard } from './admin-card'
import { EmptyState } from './empty-state'

interface AdminTableShellProps {
  /** Column header labels — purely structural, not bound to any data source. */
  columns: string[]
  /** Row content, if a module ever renders real rows. Omit to show `emptyMessage` instead. */
  children?: ReactNode
  emptyMessage?: string
}

/**
 * The reusable *chrome* around a future data table — header row + bordered
 * frame + empty-state fallback. Deliberately not a real table
 * implementation (no sorting, pagination, or row model): this phase is
 * structural only, so every module's placeholder page can preview "a
 * table will render here" without any module building its own one-off
 * table markup later just to get the same header styling.
 */
export function AdminTableShell({ columns, children, emptyMessage = 'No records yet.' }: AdminTableShellProps) {
  return (
    <AdminCard padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {columns.map((column) => (
                <th key={column} scope="col" className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {!children && (
        <div className="border-t border-white/[0.08] p-2">
          <EmptyState icon={Inbox} title={emptyMessage} />
        </div>
      )}
    </AdminCard>
  )
}
