'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/features/admin/shared'

interface AdminErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/** Route-segment error boundary for `/admin/*` — mirrors `(site)/error.tsx`'s intent with administrative framing and the shared `EmptyState` surface. */
export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description="An unexpected error occurred while rendering this admin module."
      action={
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/[0.08] bg-surface px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          Try again
        </button>
      }
    />
  )
}
