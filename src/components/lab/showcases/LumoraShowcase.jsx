import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, GitBranch, Globe } from 'lucide-react'
import BrowserMockup from '../BrowserMockup.jsx'
import MagneticButton from '../MagneticButton.jsx'
import TechLogo from '../TechLogo.jsx'

function LumoraShowcase({ project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="space-y-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <span className="font-mono text-xs text-amber-400">Featured project</span>
          <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{project.name}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{project.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {project.techStack.slice(0, 6).map((tech) => (
              <span key={tech} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface px-3 py-1.5 text-xs text-zinc-400">
                <TechLogo name={tech} size={16} />
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <MagneticButton href={project.github} variant="secondary" ariaLabel="GitHub">
              <GitBranch className="h-4 w-4" /> GitHub
            </MagneticButton>
            <MagneticButton href={project.liveDemo} variant="secondary" ariaLabel="Live demo">
              <Globe className="h-4 w-4" /> Live Demo
            </MagneticButton>
            <Link to={'/projects/' + project.slug} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
              Read more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <BrowserMockup src={project.screenshot} alt={project.name + ' screenshot'} title="lumora — study assistant" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/50 p-4 sm:p-6"
      >
        <p className="mb-4 font-mono text-xs text-purple-400">How it works</p>
        <img src={project.architectureImage} alt={project.name + ' architecture'} className="w-full rounded-xl" loading="lazy" />
      </motion.div>
    </motion.article>
  )
}

export default LumoraShowcase
