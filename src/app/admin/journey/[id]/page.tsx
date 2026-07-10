import { notFound } from 'next/navigation'
import { getJourneyMilestoneForAdminById, JourneyEditor, mapJourneyRowToEditorValues } from '@/features/admin/journey'

interface Props { params: Promise<{ id: string }> }

export default async function AdminEditJourneyPage({ params }: Props) {
  const { id } = await params
  const milestone = await getJourneyMilestoneForAdminById(id)
  if (!milestone) notFound()
  return <JourneyEditor mode="edit" milestoneId={id} initialValues={mapJourneyRowToEditorValues(milestone)} />
}
