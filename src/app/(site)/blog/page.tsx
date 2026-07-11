import type { Metadata } from 'next'
import { SITE } from '@/config/site.config'
import { BlogLanding, getPublishedBlogPosts } from '@/features/portfolio/blog'

export const metadata: Metadata = {
  title: `Blog | ${SITE.name}`,
  description: `Articles and notes by ${SITE.name} on building, learning, and shipping software.`,
  alternates: { canonical: '/blog' },
  openGraph: {
    title: `Blog | ${SITE.name}`,
    description: `Articles and notes by ${SITE.name} on building, learning, and shipping software.`,
    url: '/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog | ${SITE.name}`,
    description: `Articles and notes by ${SITE.name} on building, learning, and shipping software.`,
  },
  robots: { index: true, follow: true },
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts()
  return <BlogLanding posts={posts} />
}
