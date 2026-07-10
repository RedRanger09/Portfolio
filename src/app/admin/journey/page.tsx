import type { Metadata } from 'next'
import { Route } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Journey' }

export default function AdminJourneyPage() {
  return (
    <ModulePlaceholder
      title="Journey"
      description="Manage the milestones shown in the Journey timeline."
      icon={Route}
      previewColumns={['Label', 'Year', 'Order']}
    />
  )
}
