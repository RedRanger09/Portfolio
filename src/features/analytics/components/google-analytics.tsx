'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

/**
 * GA4 browser instrumentation for the public site.
 * Loads gtag once and records the initial page view; App Router client
 * navigations are handled by `GoogleAnalyticsPageViews`.
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: true,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  )
}
