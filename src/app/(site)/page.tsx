import type { ComponentType } from 'react'
import type { SectionId } from '@/shared/types'
import { HeroSection } from '@/features/portfolio/hero'
import { AboutSection } from '@/features/portfolio/about'
import { JourneySection } from '@/features/portfolio/journey'
import { SkillsSection } from '@/features/portfolio/skills'
import { ProjectsSection } from '@/features/portfolio/projects'
import { EducationSection } from '@/features/portfolio/education'
import { CertificationsSection } from '@/features/portfolio/certifications'
import { ResumeSection } from '@/features/portfolio/resume'
import { ContactSection } from '@/features/portfolio/contact'
import { LatestWritingSection } from '@/features/portfolio/blog'
import { getPublicVisibility, getVisibleHomeSections } from '@/features/settings/visibility'

/**
 * Every section component keyed by its `SectionId` — the single place that
 * maps navigation/layout identity to the feature that renders it.
 */
const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
  top: HeroSection,
  about: AboutSection,
  journey: JourneySection,
  skills: SkillsSection,
  projects: ProjectsSection,
  education: EducationSection,
  certifications: CertificationsSection,
  resume: ResumeSection,
  contact: ContactSection,
}

/** Home page composition — section order filtered by SiteSettings visibility. */
export default async function HomePage() {
  const visibility = await getPublicVisibility()
  const sections = getVisibleHomeSections(visibility)

  return (
    <>
      {sections.map((id) => {
        const Section = SECTION_COMPONENTS[id]
        return <Section key={id} />
      })}
      {visibility.showBlog ? <LatestWritingSection /> : null}
    </>
  )
}
