import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionTitle } from '@/features/admin/shared'
import { BlogEditor } from '@/features/admin/blog'
import { isCloudinaryConfigured } from '@/features/media/data'

export const metadata: Metadata = { title: 'New post' }

export default async function AdminBlogNewPage() {
  const cloudinaryConfigured = isCloudinaryConfigured()

  return (
    <div className="space-y-6">
      <SectionTitle title="New post" description="Create a blog post with markdown content." action={<Link href="/admin/blog" className="text-sm text-zinc-400 hover:text-white">← Back to blog</Link>} />
      <BlogEditor mode="create" cloudinaryConfigured={cloudinaryConfigured} />
    </div>
  )
}
