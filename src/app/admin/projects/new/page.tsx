import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getTechnologyNamesForAdmin, ProjectEditor } from '@/features/admin/projects'
import { SectionTitle } from '@/features/admin/shared'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

export const metadata: Metadata = { title: 'New project' }

export default async function AdminNewProjectPage() {
  const [technologySuggestions, cloudinaryConfigured] = await Promise.all([
    getTechnologyNamesForAdmin(),
    Promise.resolve(isCloudinaryConfigured()),
  ])

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
        <SectionTitle title="New project" description="Create a portfolio case study. You can refine case study content after saving." />
      </div>

      <ProjectEditor mode="create" technologySuggestions={technologySuggestions} cloudinaryConfigured={cloudinaryConfigured} />
    </div>
  )
}
