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

function SetupChecklist({ data }: { data: AnalyticsDashboardData }) {
  const steps = [
    {
      done: data.trackingConfigured,
      label: 'Public tracking',
      detail: data.trackingConfigured
        ? `Measurement ID ${data.googleAnalyticsId} is installed on the public site.`
        : 'Set GOOGLE_ANALYTICS_ID (G-XXXXXXXX) in .env.local / Vercel, then restart or redeploy.',
    },
    {
      done: Boolean(data.propertyId),
      label: 'GA4 property ID',
      detail: data.propertyId
        ? `Property ${data.propertyId} is set.`
        : 'Set GA4_PROPERTY_ID to the numeric ID from GA4 Admin → Property settings.',
    },
    {
      done: data.reportingConfigured,
      label: 'Service account reporting',
      detail: data.reportingConfigured
        ? 'Data API credentials are present.'
        : 'Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, enable the Analytics Data API, and grant the service account Viewer on the GA4 property.',
    },
  ]

  return (
    <AdminCard as="section" aria-label="Setup status">
      <h2 className="text-sm font-medium text-white">Setup status</h2>
      <ul className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3 text-sm">
            <AdminBadge tone={step.done ? 'success' : 'warning'}>{step.done ? 'Ready' : 'Needed'}</AdminBadge>
            <div className="min-w-0">
              <p className="font-medium text-zinc-200">{step.label}</p>
              <p className="mt-0.5 text-zinc-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </AdminCard>
  )
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const showEmptyState = data.status === 'not_configured' || data.status === 'error'
  const showNoTraffic = data.status === 'empty'
  const showMetrics = data.status === 'live' || data.status === 'empty'

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

      {showEmptyState ? (
        <>
          <EmptyState
            icon={BarChart3}
            title={data.status === 'not_configured' ? 'Admin reporting not configured' : 'Analytics unavailable'}
            description={
              data.errorMessage ??
              'Google Analytics could not be loaded. Public page-view tracking and admin reporting use separate credentials.'
            }
          />
          <SetupChecklist data={data} />
        </>
      ) : null}

      {showNoTraffic ? (
        <EmptyState
          icon={BarChart3}
          title="No traffic yet"
          description={data.errorMessage ?? 'Google Analytics is connected, but no page views were recorded in this range.'}
        />
      ) : null}

      {showMetrics ? (
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
            <MetricList title="Top pages" emptyDescription="No page paths reported yet." rows={data.topPages} />
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
      ) : null}
    </div>
  )
}
