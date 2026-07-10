import 'server-only'

import { unstable_cache } from 'next/cache'
import { fetchGa4ReportBundle, type Ga4ReportBundle } from './ga4-reports'

/** Admin dashboard cache TTL — short enough to feel fresh, long enough to spare the Data API. */
export const GA4_DASHBOARD_CACHE_SECONDS = 300

/**
 * Cached GA4 report fetch. Keyed only by a static tag so every admin
 * request within the TTL shares one upstream call.
 */
export const getCachedGa4ReportBundle = unstable_cache(
  async (): Promise<Ga4ReportBundle> => fetchGa4ReportBundle(),
  ['ga4-dashboard-report-bundle'],
  { revalidate: GA4_DASHBOARD_CACHE_SECONDS },
)
