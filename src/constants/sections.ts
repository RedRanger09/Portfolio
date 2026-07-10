import type { SectionId } from '@/shared/types'

/**
 * The definitive top-to-bottom order of every section on the home page.
 * `NAVIGATION_ITEMS` (in `navigation.ts`) drives the Navbar and omits `top`
 * (home is a fixed top-left control; the hero is reached via that button).
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
