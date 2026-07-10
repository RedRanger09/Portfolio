import type { Metadata } from 'next'
import { CertificationsAdminList, getCertificationsForAdmin } from '@/features/admin/certifications'

export const metadata: Metadata = { title: 'Certificates' }

export default async function AdminCertificationsPage() {
  return <CertificationsAdminList items={await getCertificationsForAdmin()} />
}
