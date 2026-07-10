import { CursorGlow } from './cursor-glow'
import { SkipToContentLink } from './skip-to-content-link'
import { HomeButton } from './home-button'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { AppearancePanel, AppearanceProvider } from '@/features/appearance'

interface SiteShellProps {
  children: React.ReactNode
}

const MAIN_CONTENT_ID = 'main-content'

/**
 * The persistent application chrome — cursor FX, skip link, nav, and footer —
 * wrapped around every route's page content.
 *
 * This is a Server Component: `Navbar` and `CursorGlow` open their own
 * `"use client"` boundaries internally, so the shell itself ships no extra JS.
 * Appearance lives here (public site only) so admin keeps a fixed dark UI.
 */
export function SiteShell({ children }: SiteShellProps) {
  return (
    <AppearanceProvider>
      <div className="min-h-screen bg-background text-[var(--color-text)]">
        <CursorGlow />
        <SkipToContentLink targetId={MAIN_CONTENT_ID} />
        <HomeButton />
        <AppearancePanel />
        <Navbar />
        <main id={MAIN_CONTENT_ID} className="overflow-x-clip">
          {children}
        </main>
        <Footer />
      </div>
    </AppearanceProvider>
  )
}
