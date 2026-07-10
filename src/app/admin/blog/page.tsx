import type { Metadata } from 'next'
import { getBlogPostsForAdmin, BlogAdminList } from '@/features/admin/blog'

export const metadata: Metadata = { title: 'Blog' }

export default async function AdminBlogPage() {
  const posts = await getBlogPostsForAdmin()
  return <BlogAdminList posts={posts} />
}
