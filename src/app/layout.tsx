import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SITE } from '@/config/site.config'
import { env } from '@/config/env'
import { AppProviders } from '@/providers'
import { SiteShell } from '@/components/layout'
import './globals.css'

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
