import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getProjectForAdminById, getProjectGalleryForAdmin, getTechnologyNamesForAdmin, mapProjectRowToEditorValues, ProjectEditor } from '@/features/admin/projects'
import { SectionTitle } from '@/features/admin/shared'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

interface AdminEditProjectPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminEditProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const project = await getProjectForAdminById(id)

  return {
    title: project ? `Edit ${project.name}` : 'Edit project',
  }
}

export default async function AdminEditProjectPage({ params }: AdminEditProjectPageProps) {
  const { id } = await params
  const [project, technologySuggestions, cloudinaryConfigured, galleryItems] = await Promise.all([
    getProjectForAdminById(id),
    getTechnologyNamesForAdmin(),
    Promise.resolve(isCloudinaryConfigured()),
    getProjectGalleryForAdmin(id),
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-white focus:outline-none focus-visible:underline"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to projects
        </Link>
        <SectionTitle title={`Edit ${project.name}`} description="Update project metadata, visibility, links, and screenshot gallery." />
      </div>

      <ProjectEditor
        mode="edit"
        projectId={project.id}
        initialValues={mapProjectRowToEditorValues(project)}
        technologySuggestions={technologySuggestions}
        cloudinaryConfigured={cloudinaryConfigured}
        galleryItems={galleryItems}
      />
    </div>
  )
}
