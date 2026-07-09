'use client'

import { motion } from 'framer-motion'
import { projectCardReveal } from '../animations/variants'
import { ProjectImage } from './project-image'
import { ProjectContent } from './project-content'
import { ProjectTags } from './project-tags'
import { ProjectLinks } from './project-links'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  index: number
  comingSoonLabel: string
}

/** One grid card: thumbnail, category/name/tagline, tech badges, and Details/GitHub links. */
export function ProjectCard({ project, index, comingSoonLabel }: ProjectCardProps) {
  return (
    <motion.article
      {...projectCardReveal(index)}
      className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 transition-shadow hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
    >
      <ProjectImage
        src={project.screenshot}
        alt={project.name}
        isPlaceholder={project.isPlaceholder}
        comingSoonLabel={comingSoonLabel}
      />
      <div className="p-5">
        <ProjectContent category={project.category} name={project.name} tagline={project.tagline} />
        <ProjectTags techStack={project.techStack} limit={4} className="mt-4 gap-1.5" />
        <div className="mt-4">
          <ProjectLinks
            name={project.name}
            caseStudy={project.caseStudy}
            github={project.github}
            isPlaceholder={project.isPlaceholder}
          />
        </div>
      </div>
    </motion.article>
  )
}
