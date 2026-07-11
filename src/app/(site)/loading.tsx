'use client'

/**
 * Lightweight public route transition — avoids a blank flash while
 * Server Components stream in.
 */
export default function SiteLoading() {
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-cyan-400/80 motion-safe:animate-spin motion-reduce:animate-none" aria-hidden="true" />
    </div>
  )
}
