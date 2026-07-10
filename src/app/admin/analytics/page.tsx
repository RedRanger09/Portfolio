import type { Metadata } from 'next'
import { BarChart3 } from 'lucide-react'
import { ModulePlaceholder } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Analytics' }

export default function AdminAnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Visitor and engagement analytics — arrives with the analytics integration."
      icon={BarChart3}
    />
  )
}
