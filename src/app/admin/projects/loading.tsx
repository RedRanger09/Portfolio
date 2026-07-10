import { LoadingCard } from '@/features/admin/shared'

export default function AdminProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse motion-reduce:animate-none rounded-full bg-white/[0.08]" />
      <LoadingCard lines={6} />
    </div>
  )
}
