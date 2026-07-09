import { ProjectBackLink } from './project-back-link'
import { ProjectDetailHero } from './project-detail-hero'
import { ProjectBrowserMockup } from './project-browser-mockup'
import { ProjectDiagram } from './project-diagram'
import { ProjectDetailSection } from './project-detail-section'
import { ProjectDetailList } from './project-detail-list'
import { ProjectTags } from './project-tags'
import { ProjectFutureImprovements } from './project-future-improvements'
import { ProjectGallery } from './project-gallery'
import { ProjectDemoCta } from './project-demo-cta'
import type { Project } from '../types'

interface ProjectDetailProps {
  project: Project
}

/**
 * The full case-study page for one project, composed entirely from
 * feature-internal components. `app/projects/[slug]/page.tsx` stays a thin
 * routing shim (data fetch, `notFound()`, metadata) — all the actual UI
 * lives here, per `ARCHITECTURE.md §1`'s "routes only, no business logic"
 * rule for `app/`.
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const demoHref = project.demo?.href || project.liveDemo
  const demoLabel = project.demo?.label || 'Live demo'

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <ProjectBackLink />
        <ProjectDetailHero project={project} />

        {project.screenshot && (
          <div className="mt-10">
            <ProjectBrowserMockup src={project.screenshot} alt={project.name} title={project.slug} />
          </div>
        )}

        {project.architectureImage && (
          <ProjectDetailSection title="Architecture diagram" contentClassName="overflow-hidden p-4">
            <ProjectDiagram src={project.architectureImage} alt={`${project.name} architecture`} />
          </ProjectDetailSection>
        )}

        {project.ragPipelineImage && (
          <ProjectDetailSection title="RAG pipeline" contentClassName="overflow-hidden p-4">
            <ProjectDiagram src={project.ragPipelineImage} alt={`${project.name} RAG pipeline`} />
          </ProjectDetailSection>
        )}

        {project.overview && (
          <ProjectDetailSection title="Overview">
            <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.overview}</p>
          </ProjectDetailSection>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {project.problem && (
            <ProjectDetailSection title="Problem">
              <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.problem}</p>
            </ProjectDetailSection>
          )}
          {project.techStack.length > 0 && (
            <ProjectDetailSection title="Tech Stack">
              <ProjectTags techStack={project.techStack} className="gap-2.5" />
            </ProjectDetailSection>
          )}
        </div>

        {(project.architecture.length > 0 || project.implementation.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {project.architecture.length > 0 && (
              <ProjectDetailSection title="Architecture">
                <ProjectDetailList items={project.architecture} />
              </ProjectDetailSection>
            )}
            {project.implementation.length > 0 && (
              <ProjectDetailSection title="Implementation">
                <ProjectDetailList items={project.implementation} />
              </ProjectDetailSection>
            )}
          </div>
        )}

        {(project.challenges.length > 0 || project.lessonsLearned.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {project.challenges.length > 0 && (
              <ProjectDetailSection title="Challenges">
                <ProjectDetailList items={project.challenges} />
              </ProjectDetailSection>
            )}
            {project.lessonsLearned.length > 0 && (
              <ProjectDetailSection title="Lessons learned">
                <ProjectDetailList items={project.lessonsLearned} />
              </ProjectDetailSection>
            )}
          </div>
        )}

        {project.futureImprovements.length > 0 && (
          <ProjectDetailSection title="Future improvements">
            <ProjectFutureImprovements items={project.futureImprovements} />
          </ProjectDetailSection>
        )}

        {project.gallery.length > 0 && (
          <ProjectDetailSection title="Screenshots" bare>
            <ProjectGallery items={project.gallery} />
          </ProjectDetailSection>
        )}

        {demoHref && (
          <ProjectDetailSection title="Demo">
            <ProjectDemoCta name={project.name} label={demoLabel} href={demoHref} />
          </ProjectDetailSection>
        )}
      </div>
    </div>
  )
}
