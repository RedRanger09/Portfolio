import { useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Brain,
  BriefcaseBusiness,
  Code2,
  Download,
  FolderKanban,
  GitBranch,
  GraduationCap,
  Mail,
  BookOpen,
  ExternalLink,
  ArrowRight,
  MapPin,
  BadgeCheck,
  Sparkles,
  Workflow,
  Building2,
  Globe,
  Zap,
  Image,
  Target,
  Award,
  Cloud,
  Layout,
  Wrench,
  ChevronDown,
  Eye,
  Maximize2,
  TerminalSquare,
} from 'lucide-react'
import {
  heroData,
  aboutData,
  learningJourney,
  skillGroups,
  projects,
  education,
  certifications,
  contactInfo,
} from '../../data/portfolioData.js'
import { SITE } from '../../constants/site.js'
import { getTechLogoSlug } from '../../constants/techLogos.js'
import SectionHeader from '../../components/lab/SectionHeader.jsx'
import SectionBackdrop from '../../components/lab/SectionBackdrop.jsx'
import BrowserMockup from '../../components/lab/BrowserMockup.jsx'
import MagneticButton from '../../components/lab/MagneticButton.jsx'

/* ─── icon maps ─── */
const iconMap = { Code2, Brain, Layout, Wrench, Cloud, FolderKanban, Download, GitBranch, BriefcaseBusiness }

const socialIconMap = {
  github: GitBranch,
  linkedin: BriefcaseBusiness,
  email: Mail,
  resume: Download,
  location: MapPin,
}

const journeyIconMap = {
  GraduationCap, Brain, Workflow, Building2, Globe, Zap, Image, Target, Sparkles, Award, Code2, TerminalSquare,
}

const accentMap = {
  purple: { text: 'text-purple-400', border: 'border-purple-500/25', bg: 'bg-purple-500/10', glow: 'rgba(168,85,247,0.15)' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', glow: 'rgba(52,211,153,0.15)' },
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/25', bg: 'bg-cyan-500/10', glow: 'rgba(34,211,238,0.15)' },
  amber: { text: 'text-amber-400', border: 'border-amber-500/25', bg: 'bg-amber-500/10', glow: 'rgba(251,191,36,0.15)' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/25', bg: 'bg-pink-500/10', glow: 'rgba(244,114,182,0.15)' },
}

/* ─── colorful floating tech orbs ─── */
const TECH_ORBS = [
  { label: 'Python',      logo: 'python',              glow: '55,118,171',   x: 12, y: 14, delay: 0,   size: 30, parallax: 0.8 },
  { label: 'PyTorch',     logo: 'pytorch',             glow: '238,77,44',    x: 78, y: 7,  delay: 0.3, size: 26, parallax: 1.2 },
  { label: 'React',       logo: 'react',               glow: '97,218,251',   x: 88, y: 50, delay: 0.7, size: 28, parallax: 0.9 },
  { label: 'TensorFlow',  logo: 'tensorflow',          glow: '255,111,0',    x: 6,  y: 68, delay: 1.1, size: 26, parallax: 1.0 },
  { label: 'Gemini',      logo: 'googlegemini',        glow: '66,133,244',   x: 62, y: 82, delay: 0.5, size: 24, parallax: 1.3 },
  { label: 'GitHub',      logo: 'github',              glow: '210,210,220',  x: 90, y: 24, delay: 0.9, size: 26, parallax: 0.7 },
  { label: 'TailwindCSS', logo: 'tailwindcss',         glow: '6,182,212',    x: 26, y: 88, delay: 1.3, size: 24, parallax: 1.1 },
  { label: 'VS Code',     logo: 'visualstudiocode',    glow: '0,122,204',    x: 4,  y: 38, delay: 0.1, size: 28, parallax: 0.6 },
]

function TechOrb({ orb, shouldReduceMotion, mouseX, mouseY }) {
  const factor = orb.parallax ?? 1
  const px = useTransform(mouseX, [-0.5, 0.5], [-factor * 14, factor * 14])
  const py = useTransform(mouseY, [-0.5, 0.5], [-factor * 10, factor * 10])

  return (
    /* outer wrapper: cursor parallax via motion values */
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${orb.x}%`, top: `${orb.y}%`, x: px, y: py }}
    >
      {/* inner: float + fade animation (separate axis to avoid y conflict) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={shouldReduceMotion ? { opacity: 0.85 } : {
          opacity: [0.55, 1, 0.55],
          scale:   [1, 1.1, 1],
        }}
        transition={{ delay: orb.delay, duration: 3.5 + orb.delay * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
        style={{ width: orb.size, height: orb.size }}
      >
        {/* per-brand colored glow */}
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: '-60%',
            background: `radial-gradient(circle, rgba(${orb.glow}, 0.4) 0%, transparent 68%)`,
            filter: 'blur(3px)',
          }}
          aria-hidden="true"
        />
        <img
          src={`https://cdn.simpleicons.org/${orb.logo}`}
          alt={orb.label}
          width={orb.size}
          height={orb.size}
          className="relative drop-shadow-lg"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </motion.div>
    </motion.div>
  )
}

/* ─── bento icon lookup ─── */
const bentoIconMap = { GraduationCap, Code2, Brain }

/* ─── premium bento interest card ─── */
function InterestCard({ card, i }) {
  const a = accentMap[card.accent] || accentMap.cyan
  const Icon = bentoIconMap[card.icon] || GraduationCap

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.38 + i * 0.1, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl border ${a.border} bg-white/[0.025] p-5 shadow-[0_4px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}
    >
      {/* corner accent glow */}
      <span
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
        style={{ background: a.glow }}
        aria-hidden="true"
      />

      {/* icon square */}
      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${a.border} ${a.bg}`}>
        <Icon className={`h-[18px] w-[18px] ${a.text}`} />
      </div>

      {/* eyebrow label */}
      <p className={`font-mono text-[0.6rem] uppercase tracking-widest ${a.text}`}>{card.label}</p>

      {/* main title */}
      <p className="mt-1.5 text-sm font-semibold leading-snug text-white">{card.title}</p>

      {/* subtitle */}
      {card.subtitle && <p className="mt-0.5 text-xs text-zinc-500">{card.subtitle}</p>}

      {/* chips */}
      {card.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.items.map((item) => (
            <span
              key={item}
              className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-medium ${a.border} ${a.text} bg-black/20`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()
  const orbContainerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const iconFor = { 'View Projects': FolderKanban, 'Download Resume': Download, GitHub: GitBranch, LinkedIn: BriefcaseBusiness }

  const handleMouseMove = useCallback((e) => {
    if (shouldReduceMotion) return
    const rect = orbContainerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width)
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height)
  }, [mouseX, mouseY, shouldReduceMotion])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <section id="top" className="relative min-h-[90vh] overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
      <SectionBackdrop theme="hero" />
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">

        {/* left column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-xs tracking-widest text-cyan-400">{heroData.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">{heroData.title}</h1>
          <p className="mt-3 text-lg text-zinc-300">{heroData.subtitle}</p>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">{heroData.description}</p>

          {/* CTA buttons — single row, no duplicate social row */}
          <div className="mt-8 flex flex-wrap gap-3">
            {heroData.ctas.map((cta) => {
              const Icon = iconFor[cta.label]
              return (
                <MagneticButton
                  key={cta.label}
                  href={cta.href}
                  download={cta.download}
                  variant={cta.variant === 'primary' ? 'primary' : 'secondary'}
                  ariaLabel={cta.label}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {cta.label}
                </MagneticButton>
              )
            })}
          </div>

          {/* interest cards */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {heroData.interestCards.map((card, i) => (
              <InterestCard key={card.label} card={card} i={i} />
            ))}
          </div>
        </motion.div>

        {/* right column — profile photo + floating tech orbs */}
        <motion.div
          ref={orbContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.65 }}
          className="relative flex items-center justify-center"
          style={{ minHeight: 340 }}
        >
          {/* floating orbs */}
          {!shouldReduceMotion && TECH_ORBS.map((orb) => (
            <TechOrb key={orb.label} orb={orb} shouldReduceMotion={shouldReduceMotion} mouseX={mouseX} mouseY={mouseY} />
          ))}

          {/* profile photo */}
          <motion.div
            className="relative z-10"
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* outer glow ring */}
            <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),rgba(168,85,247,0.14),transparent_70%)] blur-xl" />
            {/* gradient ring border */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-cyan-400/60 via-purple-500/40 to-emerald-400/50" />
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.35 }}
              className="relative h-52 w-52 overflow-hidden rounded-full bg-surface shadow-[0_0_60px_rgba(34,211,238,0.15),0_20px_60px_rgba(0,0,0,0.4)]"
            >
              <motion.img
                src={heroData.profileImage}
                alt="Akshay Tiwari"
                className="h-full w-full object-cover"
                loading="eager"
              />
              {/* inner subtle overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.12),transparent_50%)]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════════════════════ */
export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="about" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label="About Me" title={aboutData.title} subtitle="A short version of how I got here." theme="about" />
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="space-y-6">
            {aboutData.story.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-base leading-relaxed text-zinc-400"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6"
            >
              <div className="flex items-center gap-2 text-purple-400">
                <BookOpen className="h-4 w-4" />
                <p className="font-mono text-xs uppercase tracking-wider">{aboutData.currentlyLearning.title}</p>
              </div>
              <ul className="mt-4 space-y-3">
                {aboutData.currentlyLearning.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">Interests</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {aboutData.interests.map((interest) => (
                  <motion.span
                    key={interest}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-full border border-white/[0.08] bg-surface/60 px-4 py-2 text-xs text-zinc-300"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   LEARNING JOURNEY — connected roadmap
══════════════════════════════════════════════════════════════ */
function JourneyCard({ step, index, total }) {
  const [expanded, setExpanded] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const Icon = journeyIconMap[step.icon] || Sparkles
  const a = accentMap[step.accent] || accentMap.cyan
  const isLast = index === total - 1

  return (
    <div className="relative flex gap-4 sm:gap-6">
      {/* vertical connector */}
      {!isLast && (
        <div className="absolute left-[1.4rem] top-12 bottom-0 w-px sm:left-[1.65rem]" style={{ background: 'linear-gradient(to bottom, rgba(99,102,241,0.4), rgba(139,92,246,0.1))' }} />
      )}

      {/* icon node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: index * 0.04, type: 'spring', stiffness: 200 }}
        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${a.border} ${a.bg} shadow-lg`}
        style={step.isCurrent ? { boxShadow: `0 0 20px ${a.glow}` } : undefined}
      >
        <Icon className={`h-5 w-5 ${a.text}`} />
        {step.isCurrent && !shouldReduceMotion && (
          <motion.div
            className={`absolute inset-0 rounded-full ${a.bg}`}
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: index * 0.04 + 0.05 }}
        className={`mb-6 flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/70 transition-all ${step.isCurrent ? `border-l-2 ${a.border.replace('border-', 'border-l-')}` : ''}`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-start justify-between gap-4 p-5 text-left"
          aria-expanded={expanded}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {step.isCurrent && (
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${a.bg} ${a.text}`}>Current</span>
              )}
              <span className="font-mono text-[0.65rem] text-zinc-500">{step.year}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">{step.label}</p>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/[0.06] px-5 pb-5 pt-3">
                <p className="text-sm leading-relaxed text-zinc-400">{step.description}</p>
                {step.subItems && step.subItems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.subItems.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${a.border} ${a.text} ${a.bg}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export function LearningJourneySection() {
  const half = Math.ceil(learningJourney.length / 2)
  const col1 = learningJourney.slice(0, half)
  const col2 = learningJourney.slice(half)

  return (
    <section id="journey" className="relative scroll-mt-28 border-y border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="experience" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          label="Learning Journey"
          title="How my interests evolved"
          subtitle="Click any milestone to read more. Chronological, based on what I actually did."
          theme="experience"
        />
        <div className="grid gap-x-16 lg:grid-cols-2">
          <div>{col1.map((step, i) => <JourneyCard key={step.id} step={step} index={i} total={col1.length} />)}</div>
          <div className="mt-6 lg:mt-0">{col2.map((step, i) => <JourneyCard key={step.id} step={step} index={i} total={col2.length} />)}</div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   SKILLS — categorized panels with colored logos
══════════════════════════════════════════════════════════════ */
function SkillLogo({ logo, name, size = 22 }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -2 }}
      className="group flex flex-col items-center gap-1.5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-background/60 transition group-hover:border-white/20">
        <img
          src={`https://cdn.simpleicons.org/${logo}`}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>
      <span className="text-[0.6rem] text-zinc-600 transition group-hover:text-zinc-400">{name}</span>
    </motion.div>
  )
}

function SkillPanel({ group, index }) {
  const Icon = iconMap[group.icon] || Brain
  const a = accentMap[group.accent] || accentMap.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-white/[0.08] bg-surface/60 p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${a.border} ${a.bg}`}>
          <Icon className={`h-4 w-4 ${a.text}`} />
        </span>
        <h3 className="text-base font-semibold text-white">{group.title}</h3>
      </div>
      <div className="flex flex-wrap gap-4">
        {group.items.map((item) => (
          <SkillLogo key={item.name} logo={item.logo} name={item.name} />
        ))}
      </div>
      {group.note && <p className="mt-4 text-xs text-zinc-600">{group.note}</p>}
    </motion.div>
  )
}

export function SkillsSection() {
  return (
    <section id="skills" className="relative scroll-mt-28 border-y border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="skills" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          label="Skills"
          title="What I work with"
          subtitle="Tools and frameworks I reach for when building coursework and side projects."
          theme="skills"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <SkillPanel key={group.title} group={group} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── small tech badge with colored logo ─── */
function TechBadge({ name }) {
  const slug = getTechLogoSlug(name)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-background/70 px-2.5 py-1 text-[0.65rem] text-zinc-400 transition hover:border-white/15 hover:text-zinc-300">
      <img
        src={`https://cdn.simpleicons.org/${slug}`}
        alt=""
        width={11}
        height={11}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {name}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════════════════════ */
export function ProjectsSection() {
  const featured = projects.find((p) => p.slug === 'lumora')
  const others = projects.filter((p) => p.slug !== 'lumora')

  return (
    <section id="projects" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="projects" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          label="Projects"
          title="Things I've actually built"
          subtitle="Lumora is the main one. The rest are smaller learning projects — with more coming."
          theme="projects"
        />

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-8 lg:grid-cols-2 lg:items-center"
          >
            <div>
              <p className="font-mono text-xs text-amber-400">Featured project</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">{featured.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{featured.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featured.techStack.slice(0, 6).map((tech) => (
                  <TechBadge key={tech} name={tech} />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MagneticButton href={'/projects/' + featured.slug} variant="primary" ariaLabel="Open Lumora case study">
                  <ArrowRight className="h-4 w-4" /> Case study
                </MagneticButton>
                {featured.github && (
                  <MagneticButton href={featured.github} variant="secondary" ariaLabel="GitHub">
                    <GitBranch className="h-4 w-4" /> GitHub
                  </MagneticButton>
                )}
                {featured.demo?.href && (
                  <MagneticButton href={featured.demo.href} variant="secondary" ariaLabel="Demo">
                    <Globe className="h-4 w-4" /> Demo
                  </MagneticButton>
                )}
              </div>
            </div>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
              <BrowserMockup src={featured.screenshot} alt={featured.name} title="lumora — preview" />
            </motion.div>
          </motion.div>
        )}

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 transition-shadow hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
            >
              <div className="relative overflow-hidden border-b border-white/[0.06]">
                <motion.img
                  src={p.screenshot}
                  alt={p.name}
                  className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {p.isPlaceholder && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
                    <p className="text-xs text-zinc-500">Coming soon</p>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-mono text-xs text-zinc-500">{p.category}</p>
                <h3 className="mt-1.5 text-base font-semibold text-white">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.techStack.slice(0, 4).map((tech) => (
                    <TechBadge key={tech} name={tech} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {!p.isPlaceholder && (
                    <a href={'/projects/' + p.slug} className="inline-flex items-center gap-1.5 text-sm text-cyan-400 transition hover:text-cyan-300">
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
                      <GitBranch className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   EDUCATION — academic timeline
══════════════════════════════════════════════════════════════ */
export function EducationSection() {
  return (
    <section id="education" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="education" />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeader label="Education" title="Academic background" theme="education" />

        <div className="relative">
          {/* animated vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute left-5 top-0 h-full w-px origin-top bg-gradient-to-b from-purple-500/60 via-cyan-500/40 to-transparent sm:left-6"
          />

          <div className="space-y-8">
            {education.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.15 }}
                className="relative flex gap-6 sm:gap-8"
              >
                {/* icon node */}
                <div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${entry.type === 'college' ? 'border-purple-500/40 bg-purple-500/15' : 'border-cyan-500/30 bg-cyan-500/10'} shadow-lg`}>
                  <GraduationCap className={`h-5 w-5 ${entry.type === 'college' ? 'text-purple-400' : 'text-cyan-400'}`} />
                </div>

                {/* card */}
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 overflow-hidden rounded-2xl border bg-surface/70 p-6 ${entry.type === 'college' ? 'border-purple-500/20' : 'border-white/[0.08]'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={`font-mono text-xs ${entry.type === 'college' ? 'text-purple-400' : 'text-cyan-400'}`}>{entry.period}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{entry.degree}</h3>
                      <p className="text-sm text-zinc-400">{entry.type === 'college' ? entry.shortName : entry.institution}</p>
                      <p className="mt-0.5 text-xs text-zinc-600">{entry.location}</p>
                    </div>
                    {entry.currentSemester && (
                      <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                        {entry.currentSemester}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">{entry.description}</p>
                  {entry.type === 'college' && (
                    <p className="mt-1 text-xs text-zinc-600">Expected graduation: {entry.expectedGraduation}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.highlights.map((h) => (
                      <span key={h} className={`rounded-full border px-3 py-1 text-xs ${entry.type === 'college' ? 'border-purple-500/15 text-zinc-400' : 'border-white/[0.08] text-zinc-500'}`}>
                        {h}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   CERTIFICATIONS
══════════════════════════════════════════════════════════════ */
export function CertificationsSection() {
  return (
    <section id="certifications" className="relative scroll-mt-28 border-t border-white/[0.06] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="certifications" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          label="Certifications"
          title="Certificates"
          subtitle="Click to verify or view credentials. Add more by editing one object in the data file."
          align="center"
          theme="certifications"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <motion.figure
              key={cert.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-surface transition-shadow hover:shadow-[0_12px_48px_rgba(0,0,0,0.5)]"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  src={cert.image}
                  alt={cert.name}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <figcaption className="p-4">
                <p className="text-sm font-semibold text-white">{cert.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  {cert.providerLogo && (
                    <img
                      src={`https://cdn.simpleicons.org/${cert.providerLogo}`}
                      alt={cert.provider}
                      width={13}
                      height={13}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <p className="text-xs text-zinc-500">{cert.provider}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {cert.completionDate && cert.completionDate !== '—' && (
                    <span className="rounded-full border border-white/[0.08] px-3 py-1 text-[0.7rem] text-zinc-500">{cert.completionDate}</span>
                  )}
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/[0.08] px-3 py-1 text-[0.7rem] text-cyan-400 transition hover:border-cyan-500/40 hover:text-cyan-300">
                      Credential
                    </a>
                  )}
                  {cert.verifyUrl && (
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[0.7rem] text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" /> Verify
                    </a>
                  )}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   RESUME — large preview + 3 buttons
══════════════════════════════════════════════════════════════ */
export function ResumeSection() {
  const shouldReduceMotion = useReducedMotion()

  const openFullscreen = () => {
    window.open(SITE.resumePath, '_blank')
  }

  return (
    <section id="resume" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="resume" />
      <div className="relative mx-auto max-w-5xl">
        <SectionHeader label="Resume" title="My Resume" theme="resume" />

        <div className="mx-auto max-w-xl">
          {/* preview — reduced ~30% from previous full-width layout */}
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.10),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.08),transparent_50%)]" />
            <img
              src={SITE.resumePreview}
              alt="Resume preview — Akshay Tiwari"
              className="relative w-full transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </motion.div>

          {/* action buttons row */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <a
              href={SITE.resumePath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface/80 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              <Eye className="h-4 w-4 text-amber-400" />
              Preview
            </a>
            <a
              href={SITE.resumePath}
              download
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:from-indigo-500 hover:to-violet-500"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              type="button"
              onClick={openFullscreen}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface/80 px-5 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              <Maximize2 className="h-4 w-4 text-cyan-400" />
              Fullscreen
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════
   CONTACT — icon cards with hover
══════════════════════════════════════════════════════════════ */
export function ContactSection() {
  return (
    <section id="contact" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="contact" />
      <div className="relative mx-auto max-w-2xl">
        <SectionHeader
          label="Contact"
          title={contactInfo.title}
          subtitle={contactInfo.description}
          align="center"
          theme="contact"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {contactInfo.methods.map((method, i) => {
            const Icon = socialIconMap[method.icon] || MapPin
            const isLink = method.href && method.href !== '#'
            const Card = isLink ? 'a' : 'div'

            const iconAccent = {
              github: 'text-white bg-zinc-800 border-zinc-700',
              linkedin: 'text-[#0A66C2] bg-[#0A66C2]/10 border-[#0A66C2]/25',
              email: 'text-amber-400 bg-amber-400/10 border-amber-500/25',
              location: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/25',
            }[method.icon] || 'text-cyan-400 bg-cyan-400/10 border-cyan-500/25'

            return (
              <motion.div
                key={method.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Card
                  href={isLink ? method.href : undefined}
                  target={isLink && method.href.startsWith('http') ? '_blank' : undefined}
                  rel={isLink && method.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-surface/60 px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-surface hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconAccent} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500">{method.label}</p>
                    <p className="truncate text-sm font-medium text-white">{method.value}</p>
                  </div>
                  {isLink && (
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-zinc-400" />
                  )}
                </Card>
              </motion.div>
            )
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <MagneticButton href={'mailto:' + SITE.email} variant="primary" ariaLabel="Send email">
            <Mail className="h-4 w-4" /> Say hello
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}
