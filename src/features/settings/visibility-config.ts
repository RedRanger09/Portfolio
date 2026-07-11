import type { NavigationItem, SectionId } from '@/shared/types'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { HOME_SECTION_ORDER } from '@/constants/sections'

/** Single source of truth for public portfolio section visibility. */
export interface PublicVisibility {
  showHero: boolean
  showAbout: boolean
  showJourney: boolean
  showSkills: boolean
  showProjects: boolean
  showEducation: boolean
  showCertificates: boolean
  showResume: boolean
  showBlog: boolean
  showContact: boolean
  showContactForm: boolean
  showInterests: boolean
}

export const DEFAULT_PUBLIC_VISIBILITY: PublicVisibility = {
  showHero: true,
  showAbout: true,
  showJourney: true,
  showSkills: true,
  showProjects: true,
  showEducation: true,
  showCertificates: true,
  showResume: true,
  showBlog: true,
  showContact: true,
  showContactForm: true,
  showInterests: true,
}

const SECTION_VISIBILITY_KEY: Record<SectionId, keyof PublicVisibility> = {
  top: 'showHero',
  about: 'showAbout',
  journey: 'showJourney',
  skills: 'showSkills',
  projects: 'showProjects',
  education: 'showEducation',
  certifications: 'showCertificates',
  resume: 'showResume',
  contact: 'showContact',
}

export function isSectionVisible(visibility: PublicVisibility, sectionId: SectionId): boolean {
  return visibility[SECTION_VISIBILITY_KEY[sectionId]]
}

/** Homepage sections that should render under current visibility. */
export function getVisibleHomeSections(visibility: PublicVisibility): SectionId[] {
  return HOME_SECTION_ORDER.filter((id) => isSectionVisible(visibility, id))
}

/**
 * Navbar / scroll-spy items derived from the same visibility config.
 * Blog is route-only (`/blog`) and gated by `showBlog`.
 */
export function getVisibleNavigationItems(visibility: PublicVisibility): NavigationItem[] {
  return NAVIGATION_ITEMS.filter((item) => {
    if (!item.id) {
      return item.href === '/blog' ? visibility.showBlog : true
    }
    return isSectionVisible(visibility, item.id)
  })
}
