import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GitBranch, Globe, ArrowRight } from 'lucide-react'
import { GlassCard, Badge } from './ui.jsx'
import { fadeInUp, revealViewport, transition } from '../utils/motion.js'

function ProjectCard({ project, large = false }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.article
      {...(shouldReduceMotion ? {} : fadeInUp)}
      viewport={revealViewport}
      transition={transition}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <GlassCard className="group flex h-full flex-col overflow-hidden p-0">
        <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-highlight p-5 sm:p-6 lg:p-8">
          <div className="rounded-[1.7rem] border border-white/[0.08] bg-background/80 p-5 sm:p-6">
            <div className="mb-8 flex items-center justify-between gap-4 text-[0.65rem] uppercase tracking-[0.28em] text-accent sm:mb-10 sm:text-xs">
              <span className="truncate">{project.category}</span>
              <Badge className="border-primary/20 bg-primary/10 text-primary">{large ? 'Featured' : 'Project'}</Badge>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-24 rounded-full bg-primary/70" />
              <div className="h-2 w-16 rounded-full bg-zinc-500/50" />
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="h-20 rounded-2xl border border-white/[0.08] bg-surface shadow-inner shadow-primary/5" />
                <div className="h-20 rounded-2xl border border-white/[0.08] bg-surface shadow-inner shadow-primary/5" />
                <div className="h-20 rounded-2xl border border-white/[0.08] bg-surface shadow-inner shadow-primary/5" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-8">
          <div className="mb-6 space-y-3">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">{project.name}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{project.description}</p>
            </div>
            <p className="text-sm leading-7 text-accent/90">{project.tagline}</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2.5">
            {project.techStack.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-3 text-sm">
            <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/60">
              <GitBranch className="h-4 w-4" aria-hidden="true" /> GitHub
            </a>
            <a href={project.liveDemo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/60">
              <Globe className="h-4 w-4" aria-hidden="true" /> Live Demo
            </a>
            <Link to={'/projects/' + project.slug} className="inline-flex items-center gap-2 text-primary transition hover:text-accent focus:outline-none focus:ring-2 focus:ring-primary/60">
              Read More <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.article>
  )
}

export default memo(ProjectCard)
