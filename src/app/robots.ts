import type { MetadataRoute } from 'next'
import { env } from '@/config/env'

/**
 * Crawler directives for the public portfolio.
 * Admin, auth, and API routes are excluded — they are not indexable content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/sign-in', '/sign-up', '/unauthorized', '/api/'],
    },
    sitemap: `${env.appUrl}/sitemap.xml`,
  }
}
