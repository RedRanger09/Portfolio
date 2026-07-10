'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/** Route-segment error boundary — Next.js renders this in place of the failing subtree. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-pink-400">Error</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-500">An unexpected error occurred while rendering this page.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.08] bg-surface px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-primary/60"
      >
        Try again
      </button>
    </div>
  )
}
