import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getHeroForAdmin, getDefaultHeroEditorValues, HeroEditor, mapHeroRowToEditorValues } from '@/features/admin/hero'
import { SectionTitle } from '@/features/admin/shared'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

export const metadata: Metadata = { title: 'Hero' }

export default async function AdminHeroPage() {
  const row = await getHeroForAdmin()
  const initialValues = row ? mapHeroRowToEditorValues(row) : getDefaultHeroEditorValues()

  return (
    <div className="space-y-6">
      <SectionTitle title="Hero" description="Edit the landing section copy, profile image, interest cards, and CTAs." action={<Link href="/#top" target="_blank" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ExternalLink className="h-4 w-4" /> Preview</Link>} />
      <HeroEditor initialValues={initialValues} cloudinaryConfigured={isCloudinaryConfigured()} />
    </div>
  )
}
