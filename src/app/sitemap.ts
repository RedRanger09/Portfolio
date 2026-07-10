import type { MetadataRoute } from 'next'
import { env } from '@/config/env'
import { getAllProjectSlugs } from '@/features/portfolio/projects'

/**
 * Public URL index for search engines.
 * Project slugs are resolved at request time with a static fallback when the
 * database is unavailable (same pattern as `generateStaticParams`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.appUrl
  const slugs = await getAllProjectSlugs()
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...slugs.map((slug) => ({
      url: `${baseUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
