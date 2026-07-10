import Link from 'next/link'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

/**
 * Next.js's `global-not-found.js` convention (`experimental.globalNotFound`
 * in `next.config.ts`) — the one 404 boundary that sits *outside* every
 * root layout, for a URL that matches neither `(site)`'s tree nor
 * `/admin`'s tree at all (e.g. a typo'd top-level path). Once there's more
 * than one root layout, Next.js has no single shared layout left to
 * compose a "global" 404 from, so this file must be fully self-contained —
 * its own `<html>`/`<body>`, its own font and global stylesheet import —
 * per the framework's documented requirement for this file.
 *
 * This is deliberately *not* the 404 most visitors will ever see:
 * `(site)/not-found.tsx` (styled identically) still handles every
 * `notFound()` call and unmatched path within the public site itself
 * (e.g. `/projects/some-bad-slug`), and `admin/not-found.tsx` handles the
 * same within `/admin/*`. This file is the last-resort fallback for
 * anything outside both.
 */

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background text-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">404</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Page not found</h1>
          <p className="mt-3 max-w-sm text-sm text-zinc-500">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-primary/30 bg-gradient-cta px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-primary/70"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  )
}
