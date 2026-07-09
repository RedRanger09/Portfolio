import type { AccentColor, SectionTheme } from '@/shared/types'

/**
 * Per-section accent color + glow, used by `SectionHeader` and `SectionBackdrop`
 * to keep every major section visually distinct while sharing one design language.
 */
export const SECTION_THEMES: Record<string, SectionTheme> = {
  hero: { accent: 'cyan', glow: 'rgba(34, 211, 238, 0.12)' },
  about: { accent: 'purple', glow: 'rgba(168, 85, 247, 0.12)' },
  skills: { accent: 'emerald', glow: 'rgba(52, 211, 153, 0.12)' },
  projects: { accent: 'amber', glow: 'rgba(251, 191, 36, 0.1)' },
  experience: { accent: 'pink', glow: 'rgba(244, 114, 182, 0.1)' },
  education: { accent: 'purple', glow: 'rgba(139, 92, 246, 0.1)' },
  certifications: { accent: 'cyan', glow: 'rgba(34, 211, 238, 0.1)' },
  achievements: { accent: 'emerald', glow: 'rgba(16, 185, 129, 0.1)' },
  github: { accent: 'purple', glow: 'rgba(168, 85, 247, 0.08)' },
  resume: { accent: 'amber', glow: 'rgba(245, 158, 11, 0.1)' },
  contact: { accent: 'cyan', glow: 'rgba(6, 182, 212, 0.1)' },
}

/** Tailwind class bundle for a given accent — text / border / background / glow. */
export interface AccentClasses {
  text: string
  border: string
  bg: string
  glow: string
}

export const ACCENT_CLASSES: Record<AccentColor, AccentClasses> = {
  purple: { text: 'text-purple-400', border: 'border-purple-500/25', bg: 'bg-purple-500/10', glow: 'rgba(168,85,247,0.15)' },
  emerald: { text: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', glow: 'rgba(52,211,153,0.15)' },
  cyan: { text: 'text-cyan-400', border: 'border-cyan-500/25', bg: 'bg-cyan-500/10', glow: 'rgba(34,211,238,0.15)' },
  amber: { text: 'text-amber-400', border: 'border-amber-500/25', bg: 'bg-amber-500/10', glow: 'rgba(251,191,36,0.15)' },
  pink: { text: 'text-pink-400', border: 'border-pink-500/25', bg: 'bg-pink-500/10', glow: 'rgba(244,114,182,0.15)' },
}

export const ACCENT_TEXT_CLASS: Record<AccentColor, string> = {
  cyan: 'text-cyan-400',
  purple: 'text-purple-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  pink: 'text-pink-400',
}

/**
 * Left-border variant of `ACCENT_CLASSES.border`, used by the Journey
 * timeline's "current milestone" highlight. Kept as its own literal map
 * (rather than deriving it with `.replace('border-', 'border-l-')` at
 * runtime, as the legacy implementation did) because Tailwind's JIT scanner
 * only picks up class names that appear as literal strings in source —
 * a runtime-constructed class name would silently never be generated.
 */
export const ACCENT_BORDER_LEFT_CLASS: Record<AccentColor, string> = {
  purple: 'border-l-purple-500/25',
  emerald: 'border-l-emerald-500/25',
  cyan: 'border-l-cyan-500/25',
  amber: 'border-l-amber-500/25',
  pink: 'border-l-pink-500/25',
}

export const ACCENT_GRADIENT_CLASS: Record<AccentColor, string> = {
  cyan: 'from-cyan-500/10 via-transparent to-transparent',
  purple: 'from-purple-500/10 via-transparent to-transparent',
  emerald: 'from-emerald-500/10 via-transparent to-transparent',
  amber: 'from-amber-500/10 via-transparent to-transparent',
  pink: 'from-pink-500/10 via-transparent to-transparent',
}

export function getSectionTheme(theme: string): SectionTheme {
  return SECTION_THEMES[theme] ?? SECTION_THEMES.hero!
}
