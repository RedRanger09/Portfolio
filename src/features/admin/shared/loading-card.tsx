import { AdminCard } from './admin-card'

interface LoadingCardProps {
  /** Number of skeleton text lines beneath the title bar. Defaults to 2. */
  lines?: number
}

/**
 * Pulsing skeleton used by every module's `loading.tsx` (Suspense
 * fallback) — a plain CSS `animate-pulse`, no JS, and respects
 * `prefers-reduced-motion` via Tailwind's built-in `motion-reduce:` variant.
 */
export function LoadingCard({ lines = 2 }: LoadingCardProps) {
  return (
    <AdminCard>
      <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
        <span className="sr-only">Loading…</span>
        <div className="h-4 w-1/3 rounded-full bg-white/[0.08]" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="h-3 rounded-full bg-white/[0.05]" style={{ width: index === lines - 1 ? '60%' : '90%' }} />
          ))}
        </div>
      </div>
    </AdminCard>
  )
}
