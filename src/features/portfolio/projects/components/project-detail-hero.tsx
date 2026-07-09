'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { featuredProjectReveal } from '../animations/variants'
import { ProjectDetailHeader } from './project-detail-header'
import { ProjectMetrics } from './project-metrics'
import type { Project } from '../types'

interface ProjectDetailHeroProps {
  project: Project
}

/**
 * The case study's top hero grid: identity card + metrics card, fading in
 * on load — the one place on this page that carries motion, mirroring the
 * legacy case study's single hero-level reveal. Every section below this
 * stays a static Server Component.
 */
export function ProjectDetailHero({ project }: ProjectDetailHeroProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      {...(shouldReduceMotion ? {} : featuredProjectReveal)}
      className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]"
    >
      <ProjectDetailHeader project={project} />
      {project.metrics.length > 0 && (
        <div className="rounded-[1.75rem] border border-white/[0.08] bg-surface p-6 shadow-card sm:p-8">
          <ProjectMetrics metrics={project.metrics} />
        </div>
      )}
    </motion.div>
  )
}
