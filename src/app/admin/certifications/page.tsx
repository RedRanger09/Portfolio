import type { Metadata } from 'next'
import { Award } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Certificates' }

export default function AdminCertificationsPage() {
  return (
    <ModulePlaceholder
      title="Certificates"
      description="Manage certifications and their provider, credential, and verification links."
      icon={Award}
      previewColumns={['Name', 'Provider', 'Order']}
    />
  )
}
