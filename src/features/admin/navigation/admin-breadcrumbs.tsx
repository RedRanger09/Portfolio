'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { ADMIN_NAV_ITEMS } from './admin-nav-items'

/**
 * Derives its trail from the current pathname rather than accepting an
 * `items` prop from each page. Next.js layouts only ever receive
 * `children`, not the child page's own metadata — a prop-driven version
 * would need every future module page to thread its own breadcrumb array
 * back up through the layout, which doesn't compose with the App
 * Router's rendering model. Reading `usePathname()` here (one small,
 * isolated client boundary, same justification as `AdminSidebar`) is the
 * standard pattern instead. Only goes one level deep today (Admin →
 * current module) because no admin route is nested more than one segment
 * yet; extend the split-and-map logic below once one is.
 */
export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const currentItem = ADMIN_NAV_ITEMS.find((item) => item.href !== '/admin' && pathname.startsWith(item.href))

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="shrink-0">
          <Link href="/admin" className="text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
            Admin
          </Link>
        </li>
        {currentItem && (
          <li className="flex min-w-0 items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
            <span aria-current="page" className="truncate font-medium text-white">
              {currentItem.label}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}
