import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { AboutEditor, getAboutForAdmin, getDefaultAboutEditorValues, mapAboutRowToEditorValues } from '@/features/admin/about'
import { SectionTitle } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'About' }

export default async function AdminAboutPage() {
  const row = await getAboutForAdmin()
  return (
    <div className="space-y-6">
      <SectionTitle title="About" description="Edit the About section copy and lists." action={<Link href="/#about" target="_blank" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ExternalLink className="h-4 w-4" /> Preview</Link>} />
      <AboutEditor initialValues={row ? mapAboutRowToEditorValues(row) : getDefaultAboutEditorValues()} />
    </div>
  )
}
