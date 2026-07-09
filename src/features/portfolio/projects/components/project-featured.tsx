'use client'

import { motion } from 'framer-motion'
import { featuredProjectReveal } from '../animations/variants'
import { ProjectTags } from './project-tags'
import { ProjectFeaturedLinks } from './project-featured-links'
import { ProjectBrowserMockup } from './project-browser-mockup'
import type { Project } from '../types'

interface ProjectFeaturedProps {
  project: Project
  eyebrow: string
}

/**
 * Large two-column showcase for the one project flagged `featured: true`.
 * Visually distinct from the grid cards below it, so it's its own component
 * rather than a "featured" variant bolted onto `ProjectCard`.
 */
export function ProjectFeatured({ project, eyebrow }: ProjectFeaturedProps) {
  return (
    <motion.div {...featuredProjectReveal} className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="font-mono text-xs text-amber-400">{eyebrow}</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">{project.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{project.tagline}</p>
        <ProjectTags techStack={project.techStack} limit={6} className="mt-5 gap-2" />
        <ProjectFeaturedLinks project={project} />
      </div>
      <ProjectBrowserMockup src={project.screenshot} alt={project.name} title={`${project.slug} — preview`} />
    </motion.div>
  )
}
