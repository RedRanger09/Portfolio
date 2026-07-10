import type { Metadata } from 'next'
import { Code2 } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Skills' }

export default function AdminSkillsPage() {
  return (
    <ModulePlaceholder
      title="Skills"
      description="Manage skill categories and the technologies listed under each."
      icon={Code2}
      previewColumns={['Category', 'Icon', 'Items', 'Order']}
    />
  )
}
