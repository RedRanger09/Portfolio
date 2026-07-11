import { CursorGlow } from './cursor-glow'
import { SkipToContentLink } from './skip-to-content-link'
import { HomeButton } from './home-button'
import { Navbar } from './navbar'
import { Footer } from './footer'
import { AppearancePanel, AppearanceProvider } from '@/features/appearance'
import { getPublicVisibility, getVisibleNavigationItems } from '@/features/settings/visibility'

interface SiteShellProps {
  children: React.ReactNode
}

const MAIN_CONTENT_ID = 'main-content'

/**
 * Public site chrome. Home + Appearance float at the viewport corners;
 * the sticky navbar keeps section links centered between them.
 * Navigation items are filtered once from SiteSettings visibility.
 */
export async function SiteShell({ children }: SiteShellProps) {
  const visibility = await getPublicVisibility()
  const navigationItems = getVisibleNavigationItems(visibility)

  return (
    <AppearanceProvider>
      <div className="min-h-screen bg-background text-[var(--color-text)]">
        <CursorGlow />
        <SkipToContentLink targetId={MAIN_CONTENT_ID} />
        <HomeButton />
        <AppearancePanel />
        <Navbar items={navigationItems} />
        <main id={MAIN_CONTENT_ID} className="overflow-x-clip">
          {children}
        </main>
        <Footer />
      </div>
    </AppearanceProvider>
  )
}
