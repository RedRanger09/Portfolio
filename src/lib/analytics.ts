import { env } from '@/config/env'

export type AnalyticsSource = 'google_analytics' | 'none'

export type AnalyticsDashboardStatus = 'live' | 'not_configured' | 'error' | 'empty'

/** Client-side page-view tracking is ready when a measurement ID is set. */
export function isGoogleAnalyticsTrackingConfigured(): boolean {
  return Boolean(env.googleAnalyticsId)
}

/** Admin reporting is ready when property ID + service account credentials are set. */
export function isGoogleAnalyticsReportingConfigured(): boolean {
  return Boolean(
    env.ga4PropertyId && env.googleServiceAccountEmail && env.googleServiceAccountPrivateKey,
  )
}

/** @deprecated Prefer `isGoogleAnalyticsTrackingConfigured` or `isGoogleAnalyticsReportingConfigured`. */
export function isGoogleAnalyticsConfigured(): boolean {
  return isGoogleAnalyticsTrackingConfigured() || isGoogleAnalyticsReportingConfigured()
}

export function getAnalyticsSource(): AnalyticsSource {
  return isGoogleAnalyticsReportingConfigured() ? 'google_analytics' : 'none'
}

export function getGa4PropertyResourceName(): string {
  if (!env.ga4PropertyId) {
    throw new Error('GA4_PROPERTY_ID is not configured.')
  }

  return `properties/${env.ga4PropertyId}`
}
