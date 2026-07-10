import Link from 'next/link'
import { Award, FolderKanban, Milestone, Wrench } from 'lucide-react'
import { SectionTitle, StatCard, AdminCard } from '../shared'
import { ADMIN_NAV_GROUPS } from '../navigation/admin-nav-items'

/**
 * `/admin`'s page content. The stat tiles intentionally show `'—'`
 * rather than a real count — wiring these to `getProjects().length` etc.
 * would be this phase's first bit of "business logic", which the brief
 * explicitly scopes out. Swapping each `value` for a real query is a
 * same-file, same-shape change for whichever phase adds it (the same
 * pattern the read layer itself already used in `features/portfolio/*`).
 */
export function AdminDashboardOverview() {
  const moduleLinks = ADMIN_NAV_GROUPS.slice(1).flatMap((group) => group.items)

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Dashboard"
        description="A quick overview of your portfolio content. Live metrics arrive as each module is wired to the database."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value="—" icon={FolderKanban} accent="amber" hint="Wires up with the Projects module" />
        <StatCard label="Skill categories" value="—" icon={Wrench} accent="emerald" hint="Wires up with the Skills module" />
        <StatCard label="Journey milestones" value="—" icon={Milestone} accent="purple" hint="Wires up with the Journey module" />
        <StatCard label="Certifications" value="—" icon={Award} accent="cyan" hint="Wires up with the Certificates module" />
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
