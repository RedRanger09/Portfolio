import { SkillCategoryEditor } from '@/features/admin/skills'
import { getTechnologyNamesForAdmin } from '@/features/admin/shared'

export default async function AdminNewSkillPage() {
  return <SkillCategoryEditor mode="create" technologySuggestions={await getTechnologyNamesForAdmin()} />
}
