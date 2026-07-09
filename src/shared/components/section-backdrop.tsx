import { getSectionTheme, ACCENT_GRADIENT_CLASS } from '@/constants/theme'

interface SectionBackdropProps {
  theme?: string
  className?: string
}

/**
 * Per-section ambient background: a soft accent gradient blob, a themed glow,
 * and a subtle noise texture. Purely decorative — every section uses this to
 * stay visually distinct while sharing one design language.
 *
 * No motion, no state, no client APIs — stays a Server Component so it never
 * adds to the client bundle, no matter which section renders it.
 */
export function SectionBackdrop({ theme = 'hero', className = '' }: SectionBackdropProps) {
  const { accent, glow } = getSectionTheme(theme)
  const gradient = ACCENT_GRADIENT_CLASS[accent]

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      <div className={`absolute -left-1/4 top-0 h-[50%] w-[70%] bg-gradient-to-br ${gradient} blur-3xl`} />
      <div className="absolute -right-1/4 bottom-0 h-[40%] w-[60%] rounded-full blur-3xl" style={{ background: glow }} />
      <div className="lab-noise absolute inset-0 opacity-[0.25]" />
    </div>
  )
}
