interface AppProvidersProps {
  children: React.ReactNode
}

/**
 * Single composition root for every app-wide React context provider.
 *
 * Nothing in the current design needs global client state (dark mode is
 * the only theme, and content is static), so this is intentionally a thin
 * pass-through today. It exists so future providers slot in here — and
 * only here — without ever touching `app/layout.tsx` again.
 *
 * Planned nesting order, outermost first, with the reasoning for each:
 *
 *   <AnalyticsProvider>        — outermost so it observes every route change
 *                                 and every error boundary beneath it.
 *     <ClerkProvider>          — auth identity must be available before
 *                                 anything that queries user-scoped data.
 *       <QueryClientProvider>  — TanStack Query for the Admin Dashboard /
 *                                 Blog; sits inside auth so query keys can
 *                                 depend on the current user/session.
 *         <ThemeProvider>      — if a light-mode toggle is ever added;
 *                                 purely presentational, safe to nest deep.
 *           <ChatbotProvider>  — AI portfolio chatbot session/context;
 *                                 innermost since it only needs the
 *                                 providers above it, nothing needs it.
 *             {children}
 *
 * Adding a provider = wrap `children` one level deeper here, in the order
 * above. No other file should ever import a provider directly — this file
 * is the only place that assembles them.
 *
 * Keep this a Server Component for as long as possible — only convert to
 * `"use client"` if a provider you add here requires it (most context
 * providers for client-side state, like ThemeProvider, do).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>
}
