import type { Metadata } from 'next'
import { getProjectsForAdmin, ProjectsAdminList } from '@/features/admin/projects'

export const metadata: Metadata = { title: 'Projects' }

export default async function AdminProjectsPage() {
  const projects = await getProjectsForAdmin()

  return <ProjectsAdminList projects={projects} />
}
