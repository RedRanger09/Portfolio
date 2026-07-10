import { LoadingCard } from '@/features/admin/shared'

export default function AdminEditProjectLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 animate-pulse motion-reduce:animate-none rounded-full bg-white/[0.08]" />
      <div className="h-8 w-64 animate-pulse motion-reduce:animate-none rounded-full bg-white/[0.08]" />
      <LoadingCard lines={8} />
    </div>
  )
}
