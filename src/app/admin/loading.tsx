import { LoadingCard } from '@/features/admin/shared'

/** Suspense fallback for every `/admin/*` navigation — a static skeleton, no data-fetching awareness needed at this phase. */
export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse motion-reduce:animate-none rounded-full bg-white/[0.08]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </div>
  )
}
