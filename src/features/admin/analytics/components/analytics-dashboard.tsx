'use client'

import { BarChart3, Eye, Globe, Users } from 'lucide-react'
import { AdminBadge, AdminCard, EmptyState, SectionTitle, StatCard } from '@/features/admin/shared'
import type { AnalyticsDashboardData } from '@/features/analytics/data'

interface AnalyticsDashboardProps {
  data: AnalyticsDashboardData
}

function formatMetric(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString()
}

function statusBadge(data: AnalyticsDashboardData) {
  switch (data.status) {
    case 'live':
      return <AdminBadge tone="success">Live GA4</AdminBadge>
    case 'empty':
      return <AdminBadge tone="info">Connected · no traffic</AdminBadge>
    case 'error':
      return <AdminBadge tone="danger">Unavailable</AdminBadge>
    case 'not_configured':
    default:
      return <AdminBadge tone="warning">Not configured</AdminBadge>
  }
}

function MetricList({
  title,
  emptyDescription,
  rows,
}: {
  title: string
  emptyDescription: string
  rows: Array<{ path: string; label: string; views: number }>
}) {
  return (
    <AdminCard as="section" aria-label={title}>
      <h2 className="text-sm font-medium text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{emptyDescription}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => (
            <li key={row.path} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zinc-300" title={row.path}>
                {row.label}
              </span>
              <span className="shrink-0 text-zinc-500">{row.views.toLocaleString()} views</span>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  )
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const showEmptyState = data.status === 'not_configured' || data.status === 'error'
  const showNoTraffic = data.status === 'empty'

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Analytics"
        description={
          data.dateRangeLabel
            ? `Visitor and engagement overview from Google Analytics 4 (${data.dateRangeLabel}). Cached for ${data.cacheTtlSeconds / 60} minutes.`
            : 'Visitor and engagement overview from Google Analytics 4.'
        }
        action={statusBadge(data)}
      />

      {showEmptyState && (
        <EmptyState
          icon={BarChart3}
          title={data.status === 'not_configured' ? 'Analytics not configured' : 'Analytics unavailable'}
          description={data.errorMessage ?? 'Google Analytics could not be loaded.'}
        />
      )}

      {showNoTraffic && (
        <EmptyState
          icon={BarChart3}
          title="No traffic yet"
          description={data.errorMessage ?? 'Google Analytics is connected, but no page views were recorded in this range.'}
        />
      )}

      {!showEmptyState && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={formatMetric(data.totalVisitors)} icon={Users} hint={data.dateRangeLabel ?? undefined} />
            <StatCard label="Sessions" value={formatMetric(data.sessions)} icon={Globe} />
            <StatCard label="Page views" value={formatMetric(data.pageViews)} icon={Eye} />
            <StatCard
              label="Tracking"
              value={data.trackingConfigured ? 'Installed' : 'Missing ID'}
              icon={BarChart3}
              hint={data.googleAnalyticsId ?? 'Set GOOGLE_ANALYTICS_ID'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricList
              title="Top projects"
              emptyDescription="No /projects/* page views in this range."
              rows={data.topProjects}
            />
            <MetricList
              title="Top blog posts"
              emptyDescription="No /blog/* page views in this range."
              rows={data.topBlogPosts}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricList
              title="Top pages"
              emptyDescription="No page paths reported yet."
              rows={data.topPages}
            />
            <AdminCard as="section" aria-label="Acquisition">
              <h2 className="text-sm font-medium text-white">Acquisition</h2>
              {data.acquisition.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">No acquisition channels reported yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.acquisition.map((row) => (
                    <li key={row.channel} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-zinc-300">{row.channel}</span>
                      <span className="shrink-0 text-zinc-500">{row.sessions.toLocaleString()} sessions</span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
          </div>

          <AdminCard as="section" aria-label="Recent traffic">
            <h2 className="text-sm font-medium text-white">Recent traffic</h2>
            {data.recentTraffic.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">No recent path activity in the last 7 days.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.recentTraffic.map((row) => (
                  <li key={`${row.path}-${row.at}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-mono text-zinc-300">{row.path}</span>
                    <span className="text-zinc-500">
                      {row.views.toLocaleString()} views ·{' '}
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.at))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </>
      )}
    </div>
  )
}
