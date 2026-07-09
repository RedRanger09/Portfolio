import { useEffect, useMemo, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion'
import {
  Menu,
  X,
  User,
  Map,
  Wrench,
  FolderOpen,
  GraduationCap,
  BadgeCheck,
  FileText,
  Mail,
} from 'lucide-react'
import { SITE } from '../constants/site.js'
import { navigationItems } from '../data/portfolioData.js'
import useActiveSection from '../hooks/useActiveSection.js'
import { cn } from '../utils/helpers.js'

/* ─── icon lookup per section ─── */
const NAV_ICONS = {
  about: User,
  journey: Map,
  skills: Wrench,
  projects: FolderOpen,
  education: GraduationCap,
  certifications: BadgeCheck,
  resume: FileText,
  contact: Mail,
}

/* ─── spring preset ─── */
const SPRING = { type: 'spring', stiffness: 420, damping: 36 }
const FAST   = { type: 'spring', stiffness: 550, damping: 28 }

function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const shouldReduceMotion    = useReducedMotion()
  const sectionIds            = useMemo(() => navigationItems.map((i) => i.id), [])
  const activeSection         = useActiveSection(sectionIds)

  /* ── scroll-driven values (no re-renders) ── */
  const { scrollY } = useScroll()

  // Update scrolled boolean for mobile backdrop class
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 40))

  // Nav inner padding shrinks as you scroll
  const navPt = useTransform(scrollY, [0, 80], [14, shouldReduceMotion ? 14 : 9])
  const navPb = useTransform(scrollY, [0, 80], [14, shouldReduceMotion ? 14 : 9])

  // Pill container padding shrinks
  const pillP = useTransform(scrollY, [0, 80], [5, shouldReduceMotion ? 5 : 3])

  // Header background fades in from transparent
  const headerBg = useTransform(
    scrollY,
    [0, 120],
    ['rgba(3,3,8,0)', 'rgba(3,3,8,0.86)'],
  )

  // Backdrop blur increases smoothly
  const headerBlur = useTransform(
    scrollY,
    [0, 120],
    ['blur(0px) saturate(100%)', 'blur(24px) saturate(160%)'],
  )

  // Bottom border fades in
  const headerBorderColor = useTransform(
    scrollY,
    [0, 120],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)'],
  )

  // Subtle shadow at bottom of header
  const headerShadow = useTransform(
    scrollY,
    [0, 120],
    ['0 0 0 0 rgba(0,0,0,0)', '0 1px 24px 0 rgba(0,0,0,0.45)'],
  )

  /* close menu on hash change */
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  return (
    <motion.header
      className="sticky top-0 z-50 border-b"
      style={{
        background: headerBg,
        backdropFilter: headerBlur,
        WebkitBackdropFilter: headerBlur,
        borderColor: headerBorderColor,
        boxShadow: headerShadow,
      }}
    >
      {/* ── main nav bar ── */}
      <motion.nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: navPt, paddingBottom: navPb }}
        aria-label="Primary"
      >
        {/* Brand */}
        <a
          href="#top"
          className="group flex min-w-0 items-center gap-2.5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          aria-label={'Go to ' + SITE.name + ' portfolio'}
        >
          <motion.span
            whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.93 }}
            transition={FAST}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-400 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.22)]"
          >
            AT
          </motion.span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold leading-tight tracking-tight">{SITE.name}</span>
            <span className="block truncate font-mono text-[0.6rem] leading-tight text-zinc-500">{SITE.role}</span>
          </span>
        </a>

        {/* ── Desktop pill ── */}
        <motion.div
          className="hidden items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:flex"
          style={{ padding: pillP }}
        >
          {navigationItems.map((item) => {
            const isActive = activeSection === item.id
            const Icon     = NAV_ICONS[item.id]

            return (
              <motion.a
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
                /* full variant state machine */
                initial={false}
                animate={isActive ? 'active' : 'idle'}
                whileHover={isActive ? 'activeHover' : 'hover'}
                whileTap="tap"
                className="relative flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {/* ── sliding active pill (layoutId) ── */}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.09)',
                      boxShadow:
                        '0 0 0 1px rgba(255,255,255,0.13), 0 0 18px rgba(99,102,241,0.22), inset 0 1px 0 rgba(255,255,255,0.13)',
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* ── hover fill (inactive only) ── */}
                {!isActive && !shouldReduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    variants={{
                      idle:  { opacity: 0 },
                      hover: { opacity: 1 },
                      tap:   { opacity: 0.6, scale: 0.98 },
                    }}
                    transition={{ duration: 0.12 }}
                    aria-hidden="true"
                  />
                )}

                {/* ── icon ── */}
                {Icon && (
                  shouldReduceMotion ? (
                    <span className={cn('relative z-10 flex shrink-0', isActive ? 'opacity-90' : 'opacity-45')}>
                      <Icon className="h-3 w-3" />
                    </span>
                  ) : (
                    <motion.span
                      className="relative z-10 flex shrink-0"
                      variants={{
                        idle:        { scale: 1,    opacity: 0.45 },
                        active:      { scale: 1.08, opacity: 0.90 },
                        hover:       { scale: 1.20, opacity: 0.80 },
                        activeHover: { scale: 1.15, opacity: 1.00 },
                        tap:         { scale: 0.84, opacity: 0.65 },
                      }}
                      transition={FAST}
                    >
                      <Icon className="h-3 w-3" />
                    </motion.span>
                  )
                )}

                {/* ── label ── */}
                {shouldReduceMotion ? (
                  <span className={cn('relative z-10', isActive ? 'text-white' : 'text-zinc-500')}>
                    {item.label}
                  </span>
                ) : (
                  <motion.span
                    className="relative z-10"
                    variants={{
                      idle:        { color: 'rgba(113,113,122,1)' },
                      active:      { color: 'rgba(255,255,255,1)' },
                      hover:       { color: 'rgba(212,212,216,1)' },
                      activeHover: { color: 'rgba(255,255,255,1)' },
                      tap:         { color: 'rgba(161,161,170,1)' },
                    }}
                    transition={{ duration: 0.14 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.a>
            )
          })}
        </motion.div>

        {/* ── Mobile toggle ── */}
        <motion.button
          type="button"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          transition={FAST}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white transition-colors hover:border-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{   rotate:  90,  opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                <X className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0,  opacity: 1 }}
                exit={{   rotate: -90, opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                <Menu className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'overflow-hidden border-t border-white/[0.05] px-4 pb-4 [backdrop-filter:blur(24px)] md:hidden',
              scrolled ? 'bg-[rgba(3,3,8,0.95)]' : 'bg-[rgba(3,3,8,0.80)]',
            )}
          >
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-1.5 pt-3">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.id
                const Icon     = NAV_ICONS[item.id]
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                      isActive
                        ? 'border border-white/[0.1] bg-white/[0.08] text-white'
                        : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200',
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />}
                    {item.label}
                  </a>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
