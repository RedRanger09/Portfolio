import type { Metadata } from 'next'
import { EducationAdminList, getEducationForAdmin } from '@/features/admin/education'

export const metadata: Metadata = { title: 'Education' }

export default async function AdminEducationPage() {
  return <EducationAdminList entries={await getEducationForAdmin()} />
}
