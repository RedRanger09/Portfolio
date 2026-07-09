import type { ProjectMetric } from '../types'

interface ProjectMetricsProps {
  metrics: ProjectMetric[]
}

/** Stat-card grid (label + value) shown beside the case study header. Returns null if the project has no metrics. */
export function ProjectMetrics({ metrics }: ProjectMetricsProps) {
  if (metrics.length === 0) return null

  return (
    <div className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="h-full rounded-2xl border border-white/[0.08] bg-background p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{metric.label}</p>
          <p className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">{metric.value}</p>
        </div>
      ))}
    </div>
  )
}
