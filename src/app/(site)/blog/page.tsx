import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE } from '@/config/site.config'
import { BlogLanding, getPublishedBlogPosts } from '@/features/portfolio/blog'
import { getPublicVisibility } from '@/features/settings/visibility'

export async function generateMetadata(): Promise<Metadata> {
  const visibility = await getPublicVisibility()
  if (!visibility.showBlog) {
    return { robots: { index: false, follow: false } }
  }

  return {
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
}

export default async function BlogPage() {
  const visibility = await getPublicVisibility()
  if (!visibility.showBlog) notFound()

  const posts = await getPublishedBlogPosts()
  return <BlogLanding posts={posts} />
}
