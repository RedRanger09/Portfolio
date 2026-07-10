import type { Metadata } from 'next'
import { getAnalyticsDashboardData } from '@/features/analytics/data'
import { AnalyticsDashboard } from '@/features/admin/analytics'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsDashboardData()
  return <AnalyticsDashboard data={data} />
}
