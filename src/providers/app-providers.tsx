import { ClerkProvider } from '@clerk/nextjs'
import { env } from '@/config/env'

interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Single composition root for every app-wide React context provider.
 *
 * `ClerkProvider` is the first real provider wired in — auth identity
 * must be available before anything that queries user-scoped data (future
 * TanStack Query, chatbot session, etc.). See the planned nesting order in
 * the comment block below; only Clerk is live today.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      signInUrl={env.clerkSignInUrl}
      signUpUrl={env.clerkSignUpUrl}
      signInFallbackRedirectUrl={env.clerkAfterSignInUrl}
      signUpFallbackRedirectUrl={env.clerkAfterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  )
}

/**
 * Planned nesting order, outermost first:
 *
 *   <AnalyticsProvider>     ← Phase 13: GA4 via features/analytics (site layout)
 *     <ClerkProvider>          ← live (Phase 7)
 *       <QueryClientProvider>
 *         <ThemeProvider>          ← live via AppearanceProvider in SiteShell
 *           <ChatbotProvider>
 *             {children}
 */
