'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

interface GoogleAnalyticsPageViewsProps {
  measurementId: string
}

function waitForGtag(timeoutMs = 4000): Promise<boolean> {
  if (typeof window.gtag === 'function') return Promise.resolve(true)

  return new Promise((resolve) => {
    const started = Date.now()
    const timer = window.setInterval(() => {
      if (typeof window.gtag === 'function') {
        window.clearInterval(timer)
        resolve(true)
        return
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(timer)
        resolve(false)
      }
    }, 50)
  })
}

/**
 * Sends a GA4 page_view on App Router client navigations.
 * Skips the first render — `GoogleAnalytics` already records that via `gtag('config')`.
 */
export function GoogleAnalyticsPageViews({ measurementId }: GoogleAnalyticsPageViewsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstPath = useRef(true)

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false
      return
    }

    const query = searchParams.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    let cancelled = false

    void waitForGtag().then((ready) => {
      if (cancelled || !ready || typeof window.gtag !== 'function') return

      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
        send_to: measurementId,
      })
    })

    return () => {
      cancelled = true
    }
  }, [measurementId, pathname, searchParams])

  return null
}
