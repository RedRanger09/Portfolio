import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { EmptyState } from '@/features/admin/shared'

/** Handles any unmatched `/admin/*` path — distinct from `(site)/not-found.tsx` and `app/global-not-found.tsx`, scoped to this route segment. */
export default function AdminNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Admin page not found"
      description="The admin page you're looking for doesn't exist or may have moved."
      action={
        <Link
          href="/admin"
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-primary/30 bg-gradient-cta px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-primary/70"
        >
          Back to dashboard
        </Link>
      }
    />
  )
}
