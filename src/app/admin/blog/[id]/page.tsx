import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostForAdminById, BlogEditor, mapBlogRowToEditorValues } from '@/features/admin/blog'
import { SectionTitle } from '@/features/admin/shared'
import { isCloudinaryConfigured } from '@/features/media/data'

interface AdminBlogEditPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminBlogEditPageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getBlogPostForAdminById(id)
  return { title: post ? `Edit: ${post.title}` : 'Edit post' }
}

export default async function AdminBlogEditPage({ params }: AdminBlogEditPageProps) {
  const { id } = await params
  const post = await getBlogPostForAdminById(id)

  if (!post) notFound()

  const cloudinaryConfigured = isCloudinaryConfigured()

  return (
    <div className="space-y-6">
      <SectionTitle title="Edit post" description={post.title} action={<Link href="/admin/blog" className="text-sm text-zinc-400 hover:text-white">← Back to blog</Link>} />
      <BlogEditor mode="edit" postId={post.id} initialValues={mapBlogRowToEditorValues(post)} cloudinaryConfigured={cloudinaryConfigured} />
    </div>
  )
}
