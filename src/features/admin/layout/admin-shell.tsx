import { SkipToContentLink } from '@/components/layout'
import { AdminSidebar } from '../navigation/admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { AdminFooter } from './admin-footer'

interface AdminShellProps {
  children: React.ReactNode
}

const MAIN_CONTENT_ID = 'admin-main-content'

/**
 * The persistent admin chrome — sidebar, topbar, content container,
 * footer — wrapped around every `/admin/*` route. Structurally the same
 * idea as the public `SiteShell` (Server Component composing client nav
 * pieces around a plain `<main>`), but its own component because the two
 * shells share no markup: a sidebar+topbar dashboard layout and a
 * navbar+footer marketing layout are different enough shapes that
 * forcing one shared component to render both would need more
 * conditional branching than the two staying separate.
 *
 * Reuses `SkipToContentLink` from `@/components/layout` as-is — it's
 * already generic (just `{ targetId }`), so this is the "reuse existing
 * shared UI where appropriate" case rather than a reason to fork it.
 */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-white">
      <SkipToContentLink targetId={MAIN_CONTENT_ID} />
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-clip">
        <AdminTopbar />
        <main id={MAIN_CONTENT_ID} className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <AdminFooter />
      </div>
    </div>
  )
}
