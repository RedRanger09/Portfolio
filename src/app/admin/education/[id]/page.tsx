import { notFound } from 'next/navigation'
import { EducationEditor, getEducationForAdminById, mapEducationRowToEditorValues } from '@/features/admin/education'

interface Props { params: Promise<{ id: string }> }

export default async function AdminEditEducationPage({ params }: Props) {
  const { id } = await params
  const row = await getEducationForAdminById(id)
  if (!row) notFound()
  return <EducationEditor mode="edit" entryId={id} initialValues={mapEducationRowToEditorValues(row)} />
}
