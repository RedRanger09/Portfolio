import type { SectionId } from '@/shared/types'

/**
 * The definitive top-to-bottom order of every section on the home page.
 * `NAVIGATION_ITEMS` (in `navigation.ts`) drives the Navbar and omits `top`
 * (the hero has no nav entry of its own — it's reached via the brand logo).
 *
 * `app/page.tsx` maps over this array to compose the page, so reordering
 * sections is a one-line change here rather than a page rewrite.
 */
export const HOME_SECTION_ORDER: SectionId[] = [
  'top',
  'about',
  'journey',
  'skills',
  'projects',
  'education',
  'certifications',
  'resume',
  'contact',
]

export const SECTION_LABELS: Record<SectionId, string> = {
  top: 'Hero',
  about: 'About Me',
  journey: 'Learning Journey',
  skills: 'Skills',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certificates',
  resume: 'Resume',
  contact: 'Contact',
}
