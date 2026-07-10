import { prisma } from '@/lib/prisma'
import {
  getAnalyticsSource,
  isGoogleAnalyticsReportingConfigured,
  isGoogleAnalyticsTrackingConfigured,
  type AnalyticsDashboardStatus,
  type AnalyticsSource,
} from '@/lib/analytics'
import { env } from '@/config/env'
import { getCachedGa4ReportBundle } from './lib/ga4-cache'
import type { Ga4PathMetric, Ga4ReportBundle } from './lib/ga4-reports'

export interface AnalyticsTrafficRow {
  path: string
  views: number
  label: string
}

export interface AnalyticsAcquisitionRow {
  channel: string
  sessions: number
}

export interface AnalyticsDashboardData {
  status: AnalyticsDashboardStatus
  source: AnalyticsSource
  connected: boolean
  trackingConfigured: boolean
  reportingConfigured: boolean
  googleAnalyticsId: string | null
  propertyId: string | null
  errorMessage: string | null
  totalVisitors: number | null
  sessions: number | null
  pageViews: number | null
  topPages: AnalyticsTrafficRow[]
  topProjects: AnalyticsTrafficRow[]
  topBlogPosts: AnalyticsTrafficRow[]
  acquisition: AnalyticsAcquisitionRow[]
  recentTraffic: Array<{ path: string; views: number; at: string }>
  dateRangeLabel: string | null
  cacheTtlSeconds: number
}

function emptyDashboard(partial: Partial<AnalyticsDashboardData> & Pick<AnalyticsDashboardData, 'status'>): AnalyticsDashboardData {
  return {
    source: getAnalyticsSource(),
    connected: false,
    trackingConfigured: isGoogleAnalyticsTrackingConfigured(),
    reportingConfigured: isGoogleAnalyticsReportingConfigured(),
    googleAnalyticsId: env.googleAnalyticsId ?? null,
    propertyId: env.ga4PropertyId ?? null,
    errorMessage: null,
    totalVisitors: null,
    sessions: null,
    pageViews: null,
    topPages: [],
    topProjects: [],
    topBlogPosts: [],
    acquisition: [],
    recentTraffic: [],
    dateRangeLabel: null,
    cacheTtlSeconds: 300,
    ...partial,
  }
}

function matchLabeledPaths(
  pages: Ga4PathMetric[],
  prefix: string,
  labelsBySlug: Map<string, string>,
): AnalyticsTrafficRow[] {
  const rows: AnalyticsTrafficRow[] = []

  for (const page of pages) {
    if (!page.path.startsWith(prefix)) continue

    const remainder = page.path.slice(prefix.length).replace(/\/$/, '')
    if (!remainder || remainder.includes('/')) continue

    const label = labelsBySlug.get(remainder)
    if (!label) continue

    rows.push({ path: page.path, views: page.views, label })
  }

  return rows.sort((a, b) => b.views - a.views).slice(0, 5)
}

function mapTopPages(pages: Ga4PathMetric[]): AnalyticsTrafficRow[] {
  return pages.slice(0, 10).map((page) => ({
    path: page.path,
    views: page.views,
    label: page.path,
  }))
}

function hasAnyTraffic(bundle: Ga4ReportBundle): boolean {
  return (
    bundle.overview.activeUsers > 0 ||
    bundle.overview.sessions > 0 ||
    bundle.overview.screenPageViews > 0 ||
    bundle.topPages.length > 0
  )
}

/** Assembles admin dashboard metrics from GA4 — never fabricates values. */
export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  const trackingConfigured = isGoogleAnalyticsTrackingConfigured()
  const reportingConfigured = isGoogleAnalyticsReportingConfigured()

  if (!reportingConfigured) {
    return emptyDashboard({
      status: 'not_configured',
      source: 'none',
      connected: false,
      trackingConfigured,
      reportingConfigured: false,
      errorMessage:
        'Google Analytics reporting is not configured. Set GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, then grant the service account Viewer access on the GA4 property.',
    })
  }

  try {
    const [bundle, projects, blogPosts] = await Promise.all([
      getCachedGa4ReportBundle(),
      prisma.project.findMany({
        where: { isPlaceholder: false },
        select: { slug: true, name: true },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, title: true },
      }),
    ])

    if (!hasAnyTraffic(bundle)) {
      return emptyDashboard({
        status: 'empty',
        source: 'google_analytics',
        connected: true,
        trackingConfigured,
        reportingConfigured: true,
        totalVisitors: 0,
        sessions: 0,
        pageViews: 0,
        dateRangeLabel: 'Last 28 days',
        errorMessage:
          'Google Analytics is connected, but no traffic was recorded in the selected date range yet. Confirm the measurement ID is installed on the public site and wait for GA4 processing.',
      })
    }

    const projectLabels = new Map(projects.map((project) => [project.slug, project.name]))
    const blogLabels = new Map(blogPosts.map((post) => [post.slug, post.title]))

    return {
      status: 'live',
      source: 'google_analytics',
      connected: true,
      trackingConfigured,
      reportingConfigured: true,
      googleAnalyticsId: env.googleAnalyticsId ?? null,
      propertyId: env.ga4PropertyId ?? null,
      errorMessage: null,
      totalVisitors: bundle.overview.activeUsers,
      sessions: bundle.overview.sessions,
      pageViews: bundle.overview.screenPageViews,
      topPages: mapTopPages(bundle.topPages),
      topProjects: matchLabeledPaths(bundle.topPages, '/projects/', projectLabels),
      topBlogPosts: matchLabeledPaths(bundle.topPages, '/blog/', blogLabels),
      acquisition: bundle.acquisition,
      recentTraffic: bundle.recentTraffic,
      dateRangeLabel: 'Last 28 days',
      cacheTtlSeconds: 300,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Google Analytics error.'

    return emptyDashboard({
      status: 'error',
      source: 'google_analytics',
      connected: false,
      trackingConfigured,
      reportingConfigured: true,
      errorMessage: `Unable to load Google Analytics data: ${message}`,
    })
  }
}
