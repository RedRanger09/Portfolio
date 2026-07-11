import Link from 'next/link'
import { Home } from 'lucide-react'

/**
 * Fixed top-left home control — floats independently of the nav pill row.
 */
export function HomeButton() {
  return (
    <Link
      href="/"
      className="fixed left-3 top-3 z-[60] inline-flex h-9 items-center gap-2 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-3.5 text-sm font-medium text-[var(--chrome-text)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 sm:left-4 sm:top-4"
      aria-label="Go to home page"
    >
      <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Home</span>
    </Link>
  )
}
