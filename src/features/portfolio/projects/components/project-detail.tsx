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
import { ProjectVideoEmbed } from './project-video-embed'
import { toYouTubeEmbedUrl } from '../lib/youtube'
import type { Project } from '../types'

interface ProjectDetailProps {
  project: Project
}

/**
 * The full case-study page for one project, composed entirely from
 * feature-internal components. Every optional section is gated by its
 * CMS visibility flag and content emptiness — disabled or empty sections
 * are omitted from the DOM entirely.
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const videoUrl = project.demo?.href ?? ''
  const videoEmbedUrl = videoUrl ? toYouTubeEmbedUrl(videoUrl) : null
  const videoTitle = project.demo?.label || `${project.name} demo video`
  const showVideo = project.showVideo && Boolean(videoEmbedUrl)
  const showLiveDemo = project.showLiveDemo && Boolean(project.liveDemo)

  const showProblem = project.showProblem && Boolean(project.problem)
  const showTechStack = project.showTechStack && project.techStack.length > 0
  const showArchitecture = project.showArchitecture && project.architecture.length > 0
  const showImplementation = project.showImplementation && project.implementation.length > 0
  const showChallenges = project.showChallenges && project.challenges.length > 0
  const showLessons = project.showLessonsLearned && project.lessonsLearned.length > 0

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

        {project.showArchitectureImage && project.architectureImage && (
          <ProjectDetailSection title="Architecture diagram" contentClassName="overflow-hidden p-4">
            <ProjectDiagram src={project.architectureImage} alt={`${project.name} architecture`} />
          </ProjectDetailSection>
        )}

        {project.showRagPipelineImage && project.ragPipelineImage && (
          <ProjectDetailSection title="RAG pipeline" contentClassName="overflow-hidden p-4">
            <ProjectDiagram src={project.ragPipelineImage} alt={`${project.name} RAG pipeline`} />
          </ProjectDetailSection>
        )}

        {project.showOverview && project.overview && (
          <ProjectDetailSection title={project.overviewTitle}>
            <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.overview}</p>
          </ProjectDetailSection>
        )}

        {(showProblem || showTechStack) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showProblem && (
              <ProjectDetailSection title={project.problemTitle}>
                <p className="text-sm leading-8 text-zinc-400 sm:text-base">{project.problem}</p>
              </ProjectDetailSection>
            )}
            {showTechStack && (
              <ProjectDetailSection title={project.techStackTitle}>
                <ProjectTags techStack={project.techStack} className="gap-2.5" />
              </ProjectDetailSection>
            )}
          </div>
        )}

        {(showArchitecture || showImplementation) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showArchitecture && (
              <ProjectDetailSection title={project.architectureTitle}>
                <ProjectDetailList items={project.architecture} />
              </ProjectDetailSection>
            )}
            {showImplementation && (
              <ProjectDetailSection title={project.implementationTitle}>
                <ProjectDetailList items={project.implementation} />
              </ProjectDetailSection>
            )}
          </div>
        )}

        {(showChallenges || showLessons) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {showChallenges && (
              <ProjectDetailSection title={project.challengesTitle}>
                <ProjectDetailList items={project.challenges} />
              </ProjectDetailSection>
            )}
            {showLessons && (
              <ProjectDetailSection title={project.lessonsLearnedTitle}>
                <ProjectDetailList items={project.lessonsLearned} />
              </ProjectDetailSection>
            )}
          </div>
        )}

        {project.showFutureImprovements && project.futureImprovements.length > 0 && (
          <ProjectDetailSection title={project.futureImprovementsTitle}>
            <ProjectFutureImprovements items={project.futureImprovements} />
          </ProjectDetailSection>
        )}

        {project.showGallery && project.gallery.length > 0 && (
          <ProjectDetailSection title={project.galleryTitle} bare>
            <ProjectGallery items={project.gallery} />
          </ProjectDetailSection>
        )}

        {showVideo && (
          <ProjectDetailSection title={project.videoTitle}>
            <ProjectVideoEmbed url={videoUrl} title={videoTitle} />
          </ProjectDetailSection>
        )}

        {showLiveDemo && (
          <ProjectDetailSection title={project.liveDemoTitle}>
            <ProjectDemoCta name={project.name} label={project.liveDemoTitle} href={project.liveDemo} />
          </ProjectDetailSection>
        )}
      </div>
    </div>
  )
}
