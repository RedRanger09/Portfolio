import type { Metadata } from 'next'
import { AdminDashboardOverview } from '@/features/admin/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function AdminDashboardPage() {
  return <AdminDashboardOverview />
}
