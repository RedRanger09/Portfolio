import type { Metadata } from 'next'
import { FolderKanban } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Projects' }

export default function AdminProjectsPage() {
  return (
    <ModulePlaceholder
      title="Projects"
      description="Manage the case studies shown in the public Projects section."
      icon={FolderKanban}
      previewColumns={['Name', 'Category', 'Featured', 'Updated']}
    />
  )
}
