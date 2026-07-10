import 'server-only'

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { env } from '@/config/env'
import { isGoogleAnalyticsReportingConfigured } from '@/lib/analytics'

let client: BetaAnalyticsDataClient | null = null

/** Lazily constructs the GA4 Data API client — credentials never leave the server. */
export function getGa4DataClient(): BetaAnalyticsDataClient {
  if (!isGoogleAnalyticsReportingConfigured()) {
    throw new Error(
      'Google Analytics reporting is not configured — set GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.',
    )
  }

  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: env.googleServiceAccountEmail!,
        private_key: env.googleServiceAccountPrivateKey!,
      },
    })
  }

  return client
}
