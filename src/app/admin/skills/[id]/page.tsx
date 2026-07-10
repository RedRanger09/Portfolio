import { notFound } from 'next/navigation'
import { getSkillCategoryForAdminById, mapSkillCategoryRowToEditorValues, SkillCategoryEditor } from '@/features/admin/skills'
import { getTechnologyNamesForAdmin } from '@/features/admin/shared'

interface Props { params: Promise<{ id: string }> }

export default async function AdminEditSkillPage({ params }: Props) {
  const { id } = await params
  const row = await getSkillCategoryForAdminById(id)
  if (!row) notFound()
  return <SkillCategoryEditor mode="edit" categoryId={id} initialValues={mapSkillCategoryRowToEditorValues(row)} technologySuggestions={await getTechnologyNamesForAdmin()} />
}
