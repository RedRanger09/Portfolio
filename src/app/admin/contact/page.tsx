import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { ContactEditor, getContactForAdmin, getDefaultContactEditorValues, mapContactRowToEditorValues } from '@/features/admin/contact'
import { SectionTitle } from '@/features/admin/shared'

export const metadata: Metadata = { title: 'Contact' }

export default async function AdminContactPage() {
  const row = await getContactForAdmin()
  return (
    <div className="space-y-6">
      <SectionTitle title="Contact" description="Edit contact copy and social channel cards." action={<Link href="/#contact" target="_blank" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ExternalLink className="h-4 w-4" /> Preview</Link>} />
      <ContactEditor initialValues={row ? mapContactRowToEditorValues(row) : getDefaultContactEditorValues()} />
    </div>
  )
}
