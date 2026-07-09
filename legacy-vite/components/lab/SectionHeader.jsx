import { motion, useReducedMotion } from 'framer-motion'
import { SECTION_THEMES } from '../../constants/sectionThemes.js'

const accentText = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  pink: 'text-pink-400',
}

/* index prop is accepted but ignored — clean headings only */
function SectionHeader({ label, title, subtitle, align = 'left', theme = 'hero' }) {
  const shouldReduceMotion = useReducedMotion()
  const { accent, glow } = SECTION_THEMES[theme] || SECTION_THEMES.hero
  const accentClass = accentText[accent] || accentText.cyan

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative mb-14 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full blur-3xl"
        style={{ background: glow }}
        aria-hidden="true"
      />
      {label && (
        <p className={`font-mono text-xs uppercase tracking-widest ${accentClass}`}>{label}</p>
      )}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-zinc-400">{subtitle}</p>}
    </motion.header>
  )
}

export default SectionHeader
