import { ArrowRight, GitBranch, Globe } from 'lucide-react'
import { MagneticButton } from '@/shared/components'
import type { Project } from '../types'

interface ProjectFeaturedLinksProps {
  project: Project
}

/** Case study / GitHub / Demo call-to-action row for the featured project. */
export function ProjectFeaturedLinks({ project }: ProjectFeaturedLinksProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {project.caseStudy && (
        <MagneticButton href={project.caseStudy} variant="primary" ariaLabel={`Open ${project.name} case study`}>
          <ArrowRight className="h-4 w-4" aria-hidden="true" /> Case study
        </MagneticButton>
      )}
      {project.github && (
        <MagneticButton href={project.github} variant="secondary" ariaLabel={`View ${project.name} on GitHub`}>
          <GitBranch className="h-4 w-4" aria-hidden="true" /> GitHub
        </MagneticButton>
      )}
      {project.demo?.href && (
        <MagneticButton href={project.demo.href} variant="secondary" ariaLabel={`View ${project.name} demo`}>
          <Globe className="h-4 w-4" aria-hidden="true" /> Demo
        </MagneticButton>
      )}
    </div>
  )
}
