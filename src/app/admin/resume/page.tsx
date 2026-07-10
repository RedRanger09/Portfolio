import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getDefaultResumeEditorValues, getResumeForAdmin, mapResumeRowToEditorValues, ResumeEditor } from '@/features/admin/resume'
import { SectionTitle } from '@/features/admin/shared'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

export const metadata: Metadata = { title: 'Resume' }

export default async function AdminResumePage() {
  const row = await getResumeForAdmin()
  return (
    <div className="space-y-6">
      <SectionTitle title="Resume" description="Edit resume metadata, PDF path, and preview image." action={<Link href="/#resume" target="_blank" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ExternalLink className="h-4 w-4" /> Preview</Link>} />
      <ResumeEditor initialValues={row ? mapResumeRowToEditorValues(row) : getDefaultResumeEditorValues()} cloudinaryConfigured={isCloudinaryConfigured()} />
    </div>
  )
}
