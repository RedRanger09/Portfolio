import { SECTION_THEMES } from '../../constants/sectionThemes.js'

const accentMap = {
  cyan: 'from-cyan-500/10 via-transparent to-transparent',
  purple: 'from-purple-500/10 via-transparent to-transparent',
  emerald: 'from-emerald-500/10 via-transparent to-transparent',
  amber: 'from-amber-500/10 via-transparent to-transparent',
  pink: 'from-pink-500/10 via-transparent to-transparent',
}

function SectionBackdrop({ theme = 'hero', className = '' }) {
  const { accent, glow } = SECTION_THEMES[theme] || SECTION_THEMES.hero
  const gradient = accentMap[accent] || accentMap.cyan

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      <div className={`absolute -left-1/4 top-0 h-[50%] w-[70%] bg-gradient-to-br ${gradient} blur-3xl`} />
      <div className="absolute -right-1/4 bottom-0 h-[40%] w-[60%] rounded-full blur-3xl" style={{ background: glow }} />
      <div className="lab-noise absolute inset-0 opacity-[0.25]" />
    </div>
  )
}

export default SectionBackdrop
