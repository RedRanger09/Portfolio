import { ProjectCard } from './project-card'
import type { Project } from '../types'

interface ProjectsGridProps {
  projects: Project[]
  comingSoonLabel: string
}

/** Grid of every non-featured project. No motion of its own — purely a layout wrapper. */
export function ProjectsGrid({ projects, comingSoonLabel }: ProjectsGridProps) {
  return (
    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} comingSoonLabel={comingSoonLabel} />
      ))}
    </div>
  )
}
