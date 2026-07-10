import type { Metadata } from 'next'
import { getJourneyMilestonesForAdmin, JourneyAdminList } from '@/features/admin/journey'

export const metadata: Metadata = { title: 'Journey' }

export default async function AdminJourneyPage() {
  const milestones = await getJourneyMilestonesForAdmin()
  return <JourneyAdminList milestones={milestones} />
}
