import type { Metadata } from 'next'
import { MessageSquare } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Messages' }

export default function AdminMessagesPage() {
  return (
    <ModulePlaceholder
      title="Messages"
      description="Read messages submitted through the contact form — arrives with the Resend integration."
      icon={MessageSquare}
      previewColumns={['From', 'Subject', 'Received']}
    />
  )
}
