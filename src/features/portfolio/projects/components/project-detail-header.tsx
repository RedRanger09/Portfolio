import { GitBranch, Globe } from 'lucide-react'
import { MagneticButton } from '@/shared/components'
import type { Project } from '../types'

interface ProjectDetailHeaderProps {
  project: Project
}

/**
 * The case study's identity card: category, name (the page's one `<h1>`),
 * tagline, description, and GitHub/Live-demo CTAs. Not itself a Client
 * Component — `MagneticButton` opens its own `'use client'` boundary.
 */
export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/[0.08] bg-surface p-7 shadow-card sm:p-8 lg:p-10">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-amber-400">
        {project.heroEyebrow || project.category}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.02]">
        {project.name}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">{project.tagline}</p>
      <p className="mt-6 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">{project.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {project.github && (
          <MagneticButton href={project.github} ariaLabel={`Open ${project.name} GitHub repository`}>
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            GitHub
          </MagneticButton>
        )}
        {project.liveDemo && (
          <MagneticButton href={project.liveDemo} variant="secondary" ariaLabel={`Open ${project.name} live demo`}>
            <Globe className="h-4 w-4" aria-hidden="true" />
            Live demo
          </MagneticButton>
        )}
      </div>
    </div>
  )
}
