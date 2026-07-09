import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Brain,
  BriefcaseBusiness,
  Cpu,
  Database,
  Download,
  FolderKanban,
  GitBranch,
  GraduationCap,
  Mail,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  aboutData,
  achievements,
  certifications,
  contactInfo,
  education,
  experience,
  githubActivity,
  heroData,
  projects,
  skillGroups,
} from '../data/portfolioData.js'
import { Badge, DetailList, GlassCard, PrimaryLink, SecondaryLink, Section, StatCard } from '../components/ui.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { fadeInUp, revealViewport, staggerContainer, transition } from '../utils/motion.js'

function SectionGrid({ children, className = '' }) {
  return <div className={'grid gap-6 ' + className}>{children}</div>
}

export const HeroSection = memo(function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const iconMap = {
    'View Projects': FolderKanban,
    'Download Resume': Download,
    GitHub: GitBranch,
    LinkedIn: BriefcaseBusiness,
  }

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-18 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-18">
      <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-80" />
      <div className="absolute left-0 top-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl sm:left-10 sm:top-16" />
      <div className="absolute right-0 top-28 h-52 w-52 rounded-full bg-secondary/15 blur-3xl sm:right-10" />
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12">
        <motion.div {...(shouldReduceMotion ? {} : fadeInUp)} transition={transition}>
          <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-accent sm:text-xs">
            {heroData.eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.75rem] lg:leading-[0.95]">
            {heroData.title}
          </h1>
          <p className="mt-4 text-lg font-medium text-primary sm:text-xl lg:text-2xl">{heroData.subtitle}</p>
          <p className="mt-6 max-w-2xl text-sm leading-8 text-zinc-400 sm:text-base lg:text-lg lg:leading-8">{heroData.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {heroData.ctas.map((cta) => {
              const Icon = iconMap[cta.label]
              const content = (
                <>
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{cta.label}</span>
                </>
              )

              return cta.variant === 'primary' ? (
                <PrimaryLink key={cta.label} href={cta.href} download={cta.download} ariaLabel={cta.label}>
                  {content}
                </PrimaryLink>
              ) : (
                <SecondaryLink key={cta.label} href={cta.href} download={cta.download} ariaLabel={cta.label}>
                  {content}
                </SecondaryLink>
              )
            })}
          </div>

          <SectionGrid className="mt-10 sm:grid-cols-3">
            {heroData.stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </SectionGrid>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
          animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.75, ease: 'easeOut', delay: 0.12 }}
        >
          <GlassCard className="relative overflow-hidden p-5 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="relative rounded-[2rem] border border-white/[0.08] bg-background/70 p-5 sm:p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-accent" />
                <span className="text-sm text-zinc-500">AI system design preview</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/[0.08] bg-surface p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Core Stack</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-white">LLMs + RAG + Product UI</p>
                    </div>
                    <Brain className="h-10 w-10 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/[0.08] bg-surface p-5 sm:p-6">
                    <Cpu className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
                    <p className="text-sm text-zinc-500">Model orchestration</p>
                    <p className="mt-2 text-base font-medium text-white">Cloud + local inference fallback</p>
                  </div>
                  <div className="rounded-3xl border border-white/[0.08] bg-surface p-5 sm:p-6">
                    <Database className="mb-4 h-8 w-8 text-secondary" aria-hidden="true" />
                    <p className="text-sm text-zinc-500">Retrieval systems</p>
                    <p className="mt-2 text-base font-medium text-white">Grounded answers with semantic context</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-primary/20 bg-gradient-highlight p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-accent/90">Professional illustration placeholder</p>
                      <p className="mt-2 text-lg font-semibold tracking-tight text-white">Designed to resemble a premium AI startup landing page</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
})

export function AboutSection() {
  return (
    <Section id="about" eyebrow="About" title={aboutData.title}>
      <SectionGrid className="lg:grid-cols-[1.18fr_0.82fr]">
        <GlassCard>
          <div className="space-y-5 text-sm leading-8 text-zinc-400 sm:text-base">
            {aboutData.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {aboutData.highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/[0.08] bg-background px-4 py-4 text-sm leading-7 text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-xl font-semibold tracking-tight text-white">{aboutData.currentlyLearning.title}</h3>
          <DetailList items={aboutData.currentlyLearning.items} accent className="mt-6" />
        </GlassCard>
      </SectionGrid>
    </Section>
  )
}

export function SkillsSection() {
  return (
    <Section
      id="skills"
      eyebrow="Capabilities"
      title="A practical stack for intelligent product development"
      description="From model experimentation to polished frontend execution, the toolkit is intentionally broad so ideas can move from prototype to product without compromise."
    >
      <SectionGrid className="md:grid-cols-2 xl:grid-cols-4">
        {skillGroups.map((group) => (
          <GlassCard key={group.title} className="h-full">
            <h3 className="text-xl font-semibold tracking-tight text-white">{group.title}</h3>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {group.items.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </GlassCard>
        ))}
      </SectionGrid>
    </Section>
  )
}

export function ProjectsSection() {
  const featured = projects.filter((project) => project.featured)
  const moreProjects = projects.filter((project) => !project.featured)

  return (
    <Section
      id="projects"
      eyebrow="Featured Projects"
      title="Flagship AI work with room for future expansion"
      description="The projects section is intentionally prominent, highlighting both current depth and the shape of future AI systems in the portfolio."
    >
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={revealViewport} className="space-y-6">
        {featured.map((project, index) => (
          <div key={project.slug} className={index === 0 ? 'lg:min-h-[33rem]' : ''}>
            <ProjectCard project={project} large />
          </div>
        ))}
      </motion.div>

      <SectionGrid className="mt-8 md:grid-cols-2">
        {moreProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </SectionGrid>
    </Section>
  )
}

export function ExperienceSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Section id="experience" eyebrow="Experience" title="A timeline shaped by applied learning and product execution">
      <div className="relative mx-auto max-w-4xl border-l border-white/[0.08] pl-6 sm:pl-10">
        {experience.map((item) => (
          <motion.article
            key={item.title}
            {...(shouldReduceMotion ? {} : { initial: { opacity: 0, x: 24 }, whileInView: { opacity: 1, x: 0 } })}
            viewport={revealViewport}
            transition={transition}
            className="relative mb-8 last:mb-0"
          >
            <span className="absolute -left-[2.05rem] top-2 h-4 w-4 rounded-full border-4 border-background bg-primary sm:-left-[2.55rem]" />
            <GlassCard>
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-accent">{item.period}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{item.company}</p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{item.description}</p>
            </GlassCard>
          </motion.article>
        ))}
      </div>
    </Section>
  )
}

export function EducationSection() {
  return (
    <Section id="education" eyebrow="Education" title="Academic foundation with a strong applied engineering direction">
      <GlassCard className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">{education.degree}</h3>
            <p className="mt-2 text-zinc-500">{education.institution}</p>
          </div>
          <Badge className="self-start px-4 py-2 text-sm">{education.period}</Badge>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-8 text-zinc-400 sm:text-base">{education.description}</p>
      </GlassCard>
    </Section>
  )
}

export function CertificationsSection() {
  return (
    <Section id="certifications" eyebrow="Certifications" title="Continuous validation of technical growth">
      <SectionGrid className="sm:grid-cols-2 xl:grid-cols-3">
        {certifications.map((item) => (
          <GlassCard key={item} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Award className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium leading-7 text-zinc-300">{item}</p>
          </GlassCard>
        ))}
      </SectionGrid>
    </Section>
  )
}

export function AchievementsSection() {
  return (
    <Section id="achievements" eyebrow="Achievements" title="Signals of growth, depth, and portfolio direction">
      <SectionGrid className="md:grid-cols-3">
        {achievements.map((item) => (
          <GlassCard key={item.title} className="h-full">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{item.description}</p>
          </GlassCard>
        ))}
      </SectionGrid>
    </Section>
  )
}

export function GithubActivitySection() {
  return (
    <Section id="github-activity" eyebrow="GitHub Activity" title="A future-ready slot for open-source proof and build momentum">
      <SectionGrid className="md:grid-cols-3">
        {githubActivity.map((item) => (
          <GlassCard key={item.title} className="h-full">
            <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{item.description}</p>
          </GlassCard>
        ))}
      </SectionGrid>
    </Section>
  )
}

export function ResumeSection() {
  return (
    <Section id="resume" eyebrow="Resume" title="A quick access section for recruiters and collaborators">
      <SectionGrid className="lg:grid-cols-[0.78fr_1.22fr]">
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">Download Resume</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              A downloadable resume placeholder is included and can be replaced with the final PDF at any time without touching the UI code.
            </p>
          </div>
          <div className="mt-8">
            <PrimaryLink href="/Akshay-Tiwari-Resume.txt" download ariaLabel="Download resume">
              <Download className="h-4 w-4" />
              <span>Download Resume</span>
            </PrimaryLink>
          </div>
        </GlassCard>
        <GlassCard className="min-h-[24rem] p-0">
          <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[calc(1.75rem-1px)] border border-dashed border-white/[0.08] bg-surface p-8 text-center text-sm leading-7 text-zinc-500">
            Resume preview placeholder. Replace with embedded PDF, image snapshots, or an interactive resume panel later.
          </div>
        </GlassCard>
      </SectionGrid>
    </Section>
  )
}

export function ContactSection() {
  return (
    <Section id="contact" eyebrow="Contact" title={contactInfo.title} description={contactInfo.description}>
      <SectionGrid className="lg:grid-cols-[0.85fr_1.15fr]">
        <GlassCard>
          <div className="space-y-4">
            {contactInfo.methods.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-background px-4 py-4 text-sm text-zinc-400 transition hover:border-primary/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                <span>{item.label}</span>
                <span className="text-right text-zinc-500">{item.value}</span>
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-highlight p-4 text-sm leading-7 text-zinc-300">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <p>Available for internships, research collaborations, and software engineering opportunities.</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <form className="grid gap-4" aria-label="Contact form">
            <label className="grid gap-2 text-sm text-zinc-400">
              <span>Name</span>
              <input type="text" placeholder="Your name" autoComplete="name" className="min-h-12 rounded-2xl border border-white/[0.08] bg-background px-4 py-3 text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <label className="grid gap-2 text-sm text-zinc-400">
              <span>Email</span>
              <input type="email" placeholder="your@email.com" autoComplete="email" className="min-h-12 rounded-2xl border border-white/[0.08] bg-background px-4 py-3 text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <label className="grid gap-2 text-sm text-zinc-400">
              <span>Subject</span>
              <input type="text" placeholder="Project, internship, collaboration..." className="min-h-12 rounded-2xl border border-white/[0.08] bg-background px-4 py-3 text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <label className="grid gap-2 text-sm text-zinc-400">
              <span>Message</span>
              <textarea rows="6" placeholder="Tell me about the opportunity or idea." className="rounded-2xl border border-white/[0.08] bg-background px-4 py-3 text-white placeholder:text-zinc-600 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <PrimaryLink href="mailto:akshay.tiwari.dev@gmail.com" className="justify-center sm:justify-start" ariaLabel="Send email to Akshay Tiwari">
              <Mail className="h-4 w-4" />
              <span>Send via Email</span>
            </PrimaryLink>
          </form>
        </GlassCard>
      </SectionGrid>
    </Section>
  )
}

export function FinalCtaSection() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <GlassCard className="overflow-hidden p-7 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-3xl">
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-accent sm:text-xs">Explore deeper</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.7rem] lg:leading-[1.08]">
                Review project architecture, implementation choices, and future directions.
              </h2>
            </div>
            <Link to="/projects/lumora" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-gradient-cta px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-primary/60">
              Open Lumora Case Study
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
