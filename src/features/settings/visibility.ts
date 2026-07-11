import { cache } from 'react'
import { getSiteSettingsForPublic } from './data'
import { DEFAULT_PUBLIC_VISIBILITY, type PublicVisibility } from './visibility-config'

export type { PublicVisibility }
export {
  DEFAULT_PUBLIC_VISIBILITY,
  getVisibleHomeSections,
  getVisibleNavigationItems,
  isSectionVisible,
} from './visibility-config'

/** One DB read per request — shared by homepage, nav, contact, hero, blog. */
export const getPublicVisibility = cache(async (): Promise<PublicVisibility> => {
  const settings = await getSiteSettingsForPublic()
  return {
    showHero: settings.showHero ?? DEFAULT_PUBLIC_VISIBILITY.showHero,
    showAbout: settings.showAbout ?? DEFAULT_PUBLIC_VISIBILITY.showAbout,
    showJourney: settings.showJourney ?? DEFAULT_PUBLIC_VISIBILITY.showJourney,
    showSkills: settings.showSkills ?? DEFAULT_PUBLIC_VISIBILITY.showSkills,
    showProjects: settings.showProjects ?? DEFAULT_PUBLIC_VISIBILITY.showProjects,
    showEducation: settings.showEducation ?? DEFAULT_PUBLIC_VISIBILITY.showEducation,
    showCertificates: settings.showCertificates ?? DEFAULT_PUBLIC_VISIBILITY.showCertificates,
    showResume: settings.showResume ?? DEFAULT_PUBLIC_VISIBILITY.showResume,
    showBlog: settings.showBlog ?? DEFAULT_PUBLIC_VISIBILITY.showBlog,
    showContact: settings.showContact ?? DEFAULT_PUBLIC_VISIBILITY.showContact,
    showContactForm: settings.showContactForm ?? DEFAULT_PUBLIC_VISIBILITY.showContactForm,
    showInterests: settings.showInterests ?? DEFAULT_PUBLIC_VISIBILITY.showInterests,
  }
})
