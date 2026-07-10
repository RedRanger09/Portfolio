import Link from 'next/link'
import { Award, FolderKanban, Milestone, Wrench } from 'lucide-react'
import { SectionTitle, StatCard, AdminCard } from '../shared'
import { ADMIN_NAV_GROUPS } from '../navigation/admin-nav-items'
import type { AdminDashboardStats } from './data'

interface AdminDashboardOverviewProps {
  stats: AdminDashboardStats
}

function projectsHint(stats: AdminDashboardStats['projects']): string {
  if (stats.total === 0) return 'No projects yet'
  return `${stats.published} published · ${stats.drafts} draft${stats.drafts === 1 ? '' : 's'}`
}

function skillsHint(stats: AdminDashboardStats['skills']): string {
  if (stats.categories === 0 && stats.technologies === 0) return 'No skills yet'
  return `${stats.technologies} technolog${stats.technologies === 1 ? 'y' : 'ies'}`
}

function journeyHint(stats: AdminDashboardStats['journey']): string {
  if (stats.total === 0) return 'No milestones yet'
  if (!stats.currentLabel) return `${stats.total} milestone${stats.total === 1 ? '' : 's'}`
  return stats.currentYear ? `${stats.currentLabel} · ${stats.currentYear}` : stats.currentLabel
}

function certificationsHint(stats: AdminDashboardStats['certifications']): string {
  if (stats.total === 0) return 'No certifications yet'
  if (!stats.mostRecentName) return `${stats.total} total`
  const suffix = stats.mostRecentDate ? ` · ${stats.mostRecentDate}` : ''
  return `Latest: ${stats.mostRecentName}${suffix}`
}

/** Admin home — live portfolio counts from Prisma. */
export function AdminDashboardOverview({ stats }: AdminDashboardOverviewProps) {
  const moduleLinks = ADMIN_NAV_GROUPS.slice(1).flatMap((group) => group.items)

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Dashboard"
        description="Manage your portfolio, content, media, blog, and platform from one place."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projects"
          value={stats.projects.total}
          icon={FolderKanban}
          accent="amber"
          hint={projectsHint(stats.projects)}
        />
        <StatCard
          label="Skill categories"
          value={stats.skills.categories}
          icon={Wrench}
          accent="emerald"
          hint={skillsHint(stats.skills)}
        />
        <StatCard
          label="Journey milestones"
          value={stats.journey.total}
          icon={Milestone}
          accent="purple"
          hint={journeyHint(stats.journey)}
        />
        <StatCard
          label="Certifications"
          value={stats.certifications.total}
          icon={Award}
          accent="cyan"
          hint={certificationsHint(stats.certifications)}
        />
      </div>

      <section aria-labelledby="admin-modules-heading">
        <h2 id="admin-modules-heading" className="mb-3 text-sm font-medium text-zinc-400">
          Modules
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moduleLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-xl">
                <AdminCard className="flex items-center gap-3 transition-colors duration-150 group-hover:border-white/20 group-hover:bg-surface">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <Icon className="h-4 w-4 text-zinc-400 group-hover:text-white" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-white">{item.label}</span>
                </AdminCard>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
