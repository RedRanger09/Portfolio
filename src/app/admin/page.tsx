import type { Metadata } from 'next'
import { AdminDashboardOverview, getAdminDashboardStats } from '@/features/admin/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()
  return <AdminDashboardOverview stats={stats} />
}
