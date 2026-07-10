import type { Metadata } from 'next'
import { getSkillCategoriesForAdmin, SkillsAdminList } from '@/features/admin/skills'

export const metadata: Metadata = { title: 'Skills' }

export default async function AdminSkillsPage() {
  return <SkillsAdminList categories={await getSkillCategoriesForAdmin()} />
}
