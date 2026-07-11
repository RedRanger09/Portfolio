import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
import {
  BlogArticle,
  getAdjacentBlogPosts,
  getAllPublishedBlogSlugs,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedBlogPosts,
} from '@/features/portfolio/blog'
import { getPublicVisibility } from '@/features/settings/visibility'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const visibility = await getPublicVisibility()
  if (!visibility.showBlog) return []
  const slugs = await getAllPublishedBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const visibility = await getPublicVisibility()
  if (!visibility.showBlog) return { robots: { index: false, follow: false } }

  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}

  const title = post.metaTitle || `${post.title} | ${SITE.name}`
  const description = post.metaDescription || post.excerpt
  const path = `/blog/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [SITE.name],
      tags: post.tags,
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    robots: { index: true, follow: true },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const visibility = await getPublicVisibility()
  if (!visibility.showBlog) notFound()

  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const allPosts = await getPublishedBlogPosts()
  const adjacent = await getAdjacentBlogPosts(slug, allPosts)
  const related = await getRelatedBlogPosts(slug, post.category, 3, allPosts)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage ? [post.featuredImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: SITE.name,
      url: env.appUrl,
    },
    publisher: {
      '@type': 'Person',
      name: SITE.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${env.appUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticle post={post} adjacent={adjacent} related={related} />
    </>
  )
}
