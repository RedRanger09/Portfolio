import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Blog' }

export default function AdminBlogPage() {
  return (
    <ModulePlaceholder
      title="Blog"
      description="Write and publish blog posts — arrives with the Blog feature."
      icon={Newspaper}
      previewColumns={['Title', 'Status', 'Published']}
    />
  )
}
