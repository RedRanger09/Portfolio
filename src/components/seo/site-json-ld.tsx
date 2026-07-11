import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
import { getSiteSettingsForPublic } from '@/features/settings/data'

/**
 * Person + WebSite JSON-LD for the public site root.
 * Rendered once from the site layout — keeps SEO structured data
 * without changing page composition.
 */
export async function SiteJsonLd() {
  const settings = await getSiteSettingsForPublic()
  const ogImage = settings.ogImage.startsWith('http')
    ? settings.ogImage
    : new URL(settings.ogImage, env.appUrl).toString()

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${env.appUrl}/#website`,
        url: env.appUrl,
        name: settings.siteTitle,
        description: settings.siteDescription,
        publisher: { '@id': `${env.appUrl}/#person` },
        inLanguage: 'en',
      },
      {
        '@type': 'Person',
        '@id': `${env.appUrl}/#person`,
        name: SITE.name,
        url: env.appUrl,
        email: SITE.email,
        jobTitle: SITE.role,
        address: {
          '@type': 'PostalAddress',
          addressCountry: SITE.location,
        },
        sameAs: [SITE.social.github, SITE.social.linkedin],
        image: ogImage,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
