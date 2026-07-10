'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

interface GoogleAnalyticsPageViewsProps {
  measurementId: string
}

/**
 * Sends a GA4 page_view on App Router client navigations.
 * Complements the initial `gtag('config')` page view from `GoogleAnalytics`.
 */
export function GoogleAnalyticsPageViews({ measurementId }: GoogleAnalyticsPageViewsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    const query = searchParams.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: measurementId,
    })
  }, [measurementId, pathname, searchParams])

  return null
}
