import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, GitBranch } from 'lucide-react'
import BrowserMockup from '../BrowserMockup.jsx'
import MagneticButton from '../MagneticButton.jsx'
import TechLogo from '../TechLogo.jsx'

function VisionForgeShowcase({ project }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className="grid gap-10 border-t border-white/[0.06] pt-16 lg:grid-cols-2 lg:items-center"
    >
      <div className="order-2 lg:order-1">
        <span className="font-mono text-xs text-emerald-400">{project.category}</span>
        <h3 className="mt-2 text-2xl font-semibold text-white">{project.name}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span key={tech} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1 text-xs text-zinc-500">
              <TechLogo name={tech} size={14} />
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <MagneticButton href={project.github} variant="secondary" ariaLabel="GitHub">
            <GitBranch className="h-4 w-4" /> GitHub
          </MagneticButton>
          <Link to={'/projects/' + project.slug} className="inline-flex items-center gap-1 text-sm text-emerald-400">
            Roadmap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="order-1 space-y-6 lg:order-2">
        <BrowserMockup src={project.screenshot} alt={project.name} title="visionforge — planned" />
        <img src={project.architectureImage} alt="CV pipeline" className="w-full rounded-xl border border-white/[0.06]" loading="lazy" />
      </div>
    </motion.article>
  )
}

export default VisionForgeShowcase
