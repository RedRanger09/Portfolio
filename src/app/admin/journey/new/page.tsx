import { JourneyEditor } from '@/features/admin/journey'
export default function AdminNewJourneyPage() {
  return (
    <div className="space-y-6">
      <JourneyEditor mode="create" />
    </div>
  )
}
