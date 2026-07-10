import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Contact' }

export default function AdminContactPage() {
  return (
    <ModulePlaceholder
      title="Contact"
      description="Edit contact copy and manage the social/contact method links."
      icon={Mail}
    />
  )
}
