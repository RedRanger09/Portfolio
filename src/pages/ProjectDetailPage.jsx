import { motion, useReducedMotion } from 'framer-motion'
import { Link, Navigate, useParams } from 'react-router-dom'
import { GitBranch, Globe, ArrowLeft } from 'lucide-react'
import { projects } from '../data/portfolioData.js'
import { GlassCard, PrimaryLink, SecondaryLink, Section, DetailList, StatCard } from '../components/ui.jsx'
import { fadeInUp, revealViewport, transition } from '../utils/motion.js'
import usePageMetadata from '../hooks/usePageMetadata.js'
import BrowserMockup from '../components/lab/BrowserMockup.jsx'
import TechLogo from '../components/lab/TechLogo.jsx'

function ProjectDetailPage() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)
  const shouldReduceMotion = useReducedMotion()

  usePageMetadata(
    project
      ? {
          title: project.name + ' — Project',
          description: project.description,
          type: 'article',
        }
      : {},
  )

  if (!project) {
    return <Navigate to="/" replace />
  }

  const resultsOrLessons = project.lessonsLearned?.length ? project.lessonsLearned : project.results

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/60">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to portfolio
        </Link>

        <motion.section
          {...(shouldReduceMotion ? {} : fadeInUp)}
          viewport={revealViewport}
          transition={transition}
          className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <GlassCard className="p-7 sm:p-8 lg:p-10">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-accent">{project.category}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.02]">{project.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-primary">{project.tagline}</p>
            <p className="mt-6 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">{project.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryLink href={project.github} ariaLabel={'Open ' + project.name + ' GitHub repository'}>
                <GitBranch className="h-4 w-4" />
                <span>GitHub</span>
              </PrimaryLink>
              <SecondaryLink href={project.liveDemo} ariaLabel={'Open ' + project.name + ' live demo'}>
                <Globe className="h-4 w-4" />
                <span>Live Demo</span>
              </SecondaryLink>
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <div className="grid h-full gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {(project.metrics || []).map((metric) => (
                <StatCard key={metric.label} label={metric.label} value={metric.value} className="h-full border-white/[0.08] bg-background" />
              ))}
            </div>
          </GlassCard>
        </motion.section>

        {project.screenshot && (
          <div className="mt-10">
            <BrowserMockup src={project.screenshot} alt={project.name} title={project.slug} />
          </div>
        )}

        {project.architectureImage && (
          <Section id="architecture-diagram" title="Architecture diagram" className="px-0">
            <GlassCard className="overflow-hidden p-4">
              <img src={project.architectureImage} alt={project.name + ' architecture'} className="w-full rounded-xl" loading="lazy" />
            </GlassCard>
          </Section>
        )}

        {project.ragPipelineImage && (
          <Section id="rag-pipeline" title="RAG pipeline" className="px-0">
            <GlassCard className="overflow-hidden p-4">
              <img src={project.ragPipelineImage} alt={project.name + ' RAG pipeline'} className="w-full rounded-xl" loading="lazy" />
            </GlassCard>
          </Section>
        )}

        <Section id="project-overview" title="Overview" className="px-0">
          <GlassCard>
            <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.overview}</p>
          </GlassCard>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section id="problem" title="Problem" className="px-0 py-0" align="left">
            <GlassCard>
              <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.problem}</p>
            </GlassCard>
          </Section>
          <Section id="tech-stack" title="Tech Stack" className="px-0 py-0" align="left">
            <GlassCard>
              <div className="flex flex-wrap gap-2.5">
                {project.techStack.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-400">
                    <TechLogo name={item} size={16} />
                    {item}
                  </span>
                ))}
              </div>
            </GlassCard>
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section id="architecture" title="Architecture" className="px-0 py-0" align="left">
            <GlassCard>
              <DetailList items={project.architecture} />
            </GlassCard>
          </Section>
          <Section id="implementation" title="Implementation" className="px-0 py-0" align="left">
            <GlassCard>
              <DetailList items={project.implementation} />
            </GlassCard>
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section id="challenges" title="Challenges" className="px-0 py-0" align="left">
            <GlassCard>
              <DetailList items={project.challenges || []} />
            </GlassCard>
          </Section>
          <Section id="lessons-learned" title={project.lessonsLearned?.length ? 'Lessons learned' : 'Results'} className="px-0 py-0" align="left">
            <GlassCard>
              <DetailList items={resultsOrLessons || []} />
            </GlassCard>
          </Section>
        </div>

        <Section id="future-improvements" title="Future improvements" className="px-0">
          <GlassCard>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(project.futureImprovements || []).map((item) => (
                <div key={item} className="rounded-3xl border border-primary/20 bg-gradient-highlight p-5 text-sm leading-7 text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>
        </Section>

        {(project.gallery?.length || project.screenshot) && (
          <Section id="gallery" title="Screenshots" className="px-0">
            <div className="grid gap-6 md:grid-cols-2">
              {(project.gallery || []).map((item) => (
                <figure key={item.caption} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
                  <img src={item.src} alt={item.caption} className="aspect-video w-full object-cover" loading="lazy" />
                  <figcaption className="p-4 text-sm text-zinc-400">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {(project.demo?.href || project.liveDemo) && (
          <Section id="demo" title="Demo" className="px-0">
            <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">{project.demo?.label || 'Live demo'}</p>
                <p className="mt-1 text-sm text-zinc-500">If the demo is offline, the GitHub repo has setup instructions.</p>
              </div>
              <SecondaryLink href={project.demo?.href || project.liveDemo} ariaLabel={'Open ' + project.name + ' demo'}>
                <Globe className="h-4 w-4" />
                <span>Open demo</span>
              </SecondaryLink>
            </GlassCard>
          </Section>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage
