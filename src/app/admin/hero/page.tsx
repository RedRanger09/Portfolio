import type { Metadata } from 'next'
import { Rocket } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Hero' }

export default function AdminHeroPage() {
  return (
    <ModulePlaceholder
      title="Hero"
      description="Edit the homepage hero — eyebrow, title, subtitle, description, interest cards, and CTAs."
      icon={Rocket}
    />
  )
}
