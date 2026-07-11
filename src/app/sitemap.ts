import type { MetadataRoute } from 'next'
import { env } from '@/config/env'
import { getAllProjectSlugs } from '@/features/portfolio/projects'
import { getAllPublishedBlogSlugs } from '@/features/portfolio/blog'
import { getPublicVisibility } from '@/features/settings/visibility'

/**
 * Public URL index for search engines.
 * Project and blog slugs are resolved at request time with a static fallback
 * when the database is unavailable (same pattern as `generateStaticParams`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.appUrl
  const visibility = await getPublicVisibility()
  const [projectSlugs, blogSlugs] = await Promise.all([
    visibility.showProjects ? getAllProjectSlugs() : Promise.resolve([]),
    visibility.showBlog ? getAllPublishedBlogSlugs() : Promise.resolve([]),
  ])
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...(visibility.showBlog
      ? [
          {
            url: `${baseUrl}/blog`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.85,
          },
        ]
      : []),
    ...projectSlugs.map((slug) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
