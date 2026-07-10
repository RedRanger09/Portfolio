import type { Metadata } from 'next'
import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Settings' }

export default function AdminSettingsPage() {
  return (
    <ModulePlaceholder
      title="Settings"
      description="Site-wide admin settings and account preferences — arrives with authentication."
      icon={Settings}
    />
  )
}
