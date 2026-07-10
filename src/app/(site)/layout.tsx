import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
import { getSiteSettingsForPublic } from '@/features/settings/data'
import { GoogleAnalytics, GoogleAnalyticsPageViews } from '@/features/analytics'
import { APPEARANCE_FOUC_SCRIPT } from '@/features/appearance/fouc-script'
import { AppProviders } from '@/providers'
import { SiteShell } from '@/components/layout'
import '../globals.css'

/**
 * Public site's root layout — content and behavior are unchanged from
 * before the Admin Foundation phase; only the location moved.
 *
 * Lives in the `(site)` route group (not directly in `app/`) because
 * `/admin` needs a completely different root layout (its own dashboard
 * shell, no `SiteShell` Navbar/Footer) — Next.js requires each top-level
 * root layout to declare its own `<html>`/`<body>`, so there can't be one
 * shared `app/layout.tsx` wrapping both. `(site)` is a route group (the
 * parens are stripped from the URL), so every public route's path is
 * identical to before: `/` and `/projects/[slug]` render exactly as they
 * did when this file lived at `app/layout.tsx`. See `app/admin/layout.tsx`
 * for the sibling root layout, and `app/global-not-found.tsx` for how a
 * truly unmatched URL (outside both root layouts) is still handled.
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsForPublic()

  return {
    metadataBase: new URL(env.appUrl),
    title: settings.siteTitle,
    description: settings.siteDescription,
    keywords: settings.keywords,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      url: env.appUrl,
      siteName: `${SITE.name} Portfolio`,
      images: [settings.ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteTitle,
      description: settings.siteDescription,
      images: [settings.ogImage],
    },
    icons: {
      icon: settings.favicon,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F4F5' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const measurementId = env.googleAnalyticsId

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_FOUC_SCRIPT }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {measurementId ? <GoogleAnalytics measurementId={measurementId} /> : null}
        <AppProviders>
          <SiteShell>
            {measurementId ? (
              <Suspense fallback={null}>
                <GoogleAnalyticsPageViews measurementId={measurementId} />
              </Suspense>
            ) : null}
            {children}
          </SiteShell>
        </AppProviders>
      </body>
    </html>
  )
}
