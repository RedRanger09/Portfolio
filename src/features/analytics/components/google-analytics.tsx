'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

/**
 * GA4 browser instrumentation for the public site.
 * Loads gtag once and records the initial page view; App Router navigations
 * that change the document URL are covered by GA4's enhanced measurement
 * history changes when enabled in the GA4 property (default).
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: true });
        `}
      </Script>
    </>
  )
}
