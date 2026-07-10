import type { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Resume' }

export default function AdminResumePage() {
  return (
    <ModulePlaceholder
      title="Resume"
      description="Manage the resume file and its preview image shown in the Resume section."
      icon={FileText}
    />
  )
}
