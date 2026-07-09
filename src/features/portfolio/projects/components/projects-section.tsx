import { SectionBackdrop, SectionHeader } from '@/shared/components'
import { getProjects, getFeaturedProject, getProjectsSectionContent } from '../data'
import { ProjectFeatured } from './project-featured'
import { ProjectsGrid } from './projects-grid'

/**
 * Projects — server component: fetches projects, the featured pick, and
 * section copy in parallel. `featured` is resolved from the `featured` flag
 * on the data (not a hardcoded slug), so swapping which project is
 * showcased is a one-line data change.
 */
export async function ProjectsSection() {
  const [projects, featured, content] = await Promise.all([
    getProjects(),
    getFeaturedProject(),
    getProjectsSectionContent(),
  ])
  const others = featured ? projects.filter((project) => project.slug !== featured.slug) : projects

  return (
    <section id="projects" className="relative scroll-mt-28 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <SectionBackdrop theme="projects" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeader label={content.label} title={content.title} subtitle={content.subtitle} theme="projects" />
        {featured && <ProjectFeatured project={featured} eyebrow={content.featuredEyebrow} />}
        <ProjectsGrid projects={others} comingSoonLabel={content.comingSoonLabel} />
      </div>
    </section>
  )
}
