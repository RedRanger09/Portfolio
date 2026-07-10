import 'server-only'

import { getGa4PropertyResourceName } from '@/lib/analytics'
import { getGa4DataClient } from './ga4-client'

export interface Ga4OverviewMetrics {
  activeUsers: number
  sessions: number
  screenPageViews: number
}

export interface Ga4PathMetric {
  path: string
  views: number
}

export interface Ga4AcquisitionRow {
  channel: string
  sessions: number
}

export interface Ga4RecentTrafficRow {
  path: string
  views: number
  at: string
}

export interface Ga4ReportBundle {
  overview: Ga4OverviewMetrics
  topPages: Ga4PathMetric[]
  acquisition: Ga4AcquisitionRow[]
  recentTraffic: Ga4RecentTrafficRow[]
  dateRange: { startDate: string; endDate: string }
}

const DEFAULT_RANGE = { startDate: '28daysAgo', endDate: 'today' } as const
const RECENT_RANGE = { startDate: '7daysAgo', endDate: 'today' } as const

function metricValue(row: { metricValues?: Array<{ value?: string | null }> | null }, index: number): number {
  const raw = row.metricValues?.[index]?.value
  const parsed = raw ? Number(raw) : 0
  return Number.isFinite(parsed) ? parsed : 0
}

function dimensionValue(row: { dimensionValues?: Array<{ value?: string | null }> | null }, index: number): string {
  return row.dimensionValues?.[index]?.value?.trim() || ''
}

/** Parses GA4 `dateHour` (YYYYMMDDHH) into an ISO timestamp. */
function parseDateHour(value: string): string {
  if (!/^\d{10}$/.test(value)) {
    return new Date().toISOString()
  }

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6)) - 1
  const day = Number(value.slice(6, 8))
  const hour = Number(value.slice(8, 10))
  return new Date(Date.UTC(year, month, day, hour)).toISOString()
}

async function runReport(params: {
  dateRanges: Array<{ startDate: string; endDate: string }>
  dimensions?: Array<{ name: string }>
  metrics: Array<{ name: string }>
  orderBys?: Array<{ metric?: { metricName: string }; desc?: boolean }>
  limit?: number
}) {
  const client = getGa4DataClient()
  const [response] = await client.runReport({
    property: getGa4PropertyResourceName(),
    dateRanges: params.dateRanges,
    dimensions: params.dimensions,
    metrics: params.metrics,
    orderBys: params.orderBys,
    limit: params.limit,
  })

  return response.rows ?? []
}

/** Fetches the GA4 report bundle used by the admin analytics dashboard. */
export async function fetchGa4ReportBundle(): Promise<Ga4ReportBundle> {
  const [overviewRows, topPageRows, acquisitionRows, recentRows] = await Promise.all([
    runReport({
      dateRanges: [DEFAULT_RANGE],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    }),
    runReport({
      dateRanges: [DEFAULT_RANGE],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 25,
    }),
    runReport({
      dateRanges: [DEFAULT_RANGE],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    }),
    runReport({
      dateRanges: [RECENT_RANGE],
      dimensions: [{ name: 'dateHour' }, { name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 15,
    }),
  ])

  const overviewRow = overviewRows[0]
  const overview: Ga4OverviewMetrics = {
    activeUsers: overviewRow ? metricValue(overviewRow, 0) : 0,
    sessions: overviewRow ? metricValue(overviewRow, 1) : 0,
    screenPageViews: overviewRow ? metricValue(overviewRow, 2) : 0,
  }

  const topPages: Ga4PathMetric[] = topPageRows
    .map((row) => ({
      path: dimensionValue(row, 0) || '/',
      views: metricValue(row, 0),
    }))
    .filter((row) => row.views > 0)

  const acquisition: Ga4AcquisitionRow[] = acquisitionRows
    .map((row) => ({
      channel: dimensionValue(row, 0) || 'Unassigned',
      sessions: metricValue(row, 0),
    }))
    .filter((row) => row.sessions > 0)

  const recentTraffic: Ga4RecentTrafficRow[] = recentRows
    .map((row) => ({
      path: dimensionValue(row, 1) || '/',
      views: metricValue(row, 0),
      at: parseDateHour(dimensionValue(row, 0)),
    }))
    .filter((row) => row.views > 0)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10)

  return {
    overview,
    topPages,
    acquisition,
    recentTraffic,
    dateRange: { startDate: DEFAULT_RANGE.startDate, endDate: DEFAULT_RANGE.endDate },
  }
}
