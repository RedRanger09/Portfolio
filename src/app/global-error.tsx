'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root error boundary — catches failures outside route-segment boundaries
 * (including root layout render errors). Must define its own `<html>`/`<body>`.
 */
export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[#09090B] text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-pink-400">Error</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Something went wrong</h1>
          <p className="mt-3 max-w-sm text-sm text-zinc-500">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#18181B] px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-white transition hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
