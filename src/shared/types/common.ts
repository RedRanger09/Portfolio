/**
 * Cross-cutting types used by 2+ features or by app-shell code.
 * Domain-specific shapes (Project, Certification, JourneyStep, ...) live
 * beside the feature that owns them, in each feature's own `types.ts`.
 */

/** Accent color tokens mapped to Tailwind classes in `src/constants/theme.ts`. */
export type AccentColor = 'purple' | 'emerald' | 'cyan' | 'amber' | 'pink'

/** Every section that participates in ScrollSpy navigation and theming. */
export type SectionId =
  | 'top'
  | 'about'
  | 'journey'
  | 'skills'
  | 'projects'
  | 'education'
  | 'certifications'
  | 'resume'
  | 'contact'

export interface SectionTheme {
  accent: AccentColor
  glow: string
}

export interface NavigationItem {
  label: string
  href: string
  /**
   * Homepage section id for ScrollSpy. Omit for route-only links (e.g. `/blog`)
   * that should not participate in section observation.
   */
  id?: SectionId
}
