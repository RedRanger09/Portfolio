import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Education' }

export default function AdminEducationPage() {
  return (
    <ModulePlaceholder
      title="Education"
      description="Manage schools, colleges, and their details."
      icon={GraduationCap}
      previewColumns={['Institution', 'Type', 'Period']}
    />
  )
}
