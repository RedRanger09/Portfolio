import type { Metadata } from 'next'
import { UserCircle } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'About' }

export default function AdminAboutPage() {
  return (
    <ModulePlaceholder
      title="About"
      description="Edit the About section — story, currently-learning list, and interests."
      icon={UserCircle}
    />
  )
}
