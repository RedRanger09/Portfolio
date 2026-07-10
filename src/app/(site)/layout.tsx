import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
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

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: SITE.title,
  description: SITE.description,
  keywords: SITE.keywords,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: env.appUrl,
    siteName: `${SITE.name} Portfolio`,
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icons/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AppProviders>
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  )
}
