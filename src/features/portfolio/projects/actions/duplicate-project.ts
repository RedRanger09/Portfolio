'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { toJson } from '@/lib/prisma-json'
import { resolveTechnologyIds } from '@/lib/technology-resolver'
import { PROJECT_INCLUDE, type ProjectRow } from '../data'
import { generateDuplicateSlug } from '../lib/project-slug'
import { duplicateProjectSchema } from '../schemas/project.schema'
import { MEDIA_ATTACHABLE_TYPE, MEDIA_ATTACHMENT_ROLE } from '@/features/media/lib/media-attachment-constants'
import { syncProjectGalleryJson } from '../lib/project-gallery'

/**
 * Clones an existing project with a new slug and name suffix. Reuses the
 * same transaction pattern as `create-project.ts` — project row plus
 * technology join rows must succeed together.
 */
export async function duplicateProject(input: unknown): Promise<MutationResult<ProjectRow>> {
  await assertAdminAccess()

  return runMutation(
    duplicateProjectSchema,
    input,
    async ({ id }) => {
      const source = await prisma.project.findUnique({
        where: { id },
        include: {
          ...PROJECT_INCLUDE,
        },
      })

      if (!source) {
        throw new MutationNotFoundError(`Project "${id}" does not exist.`)
      }

      const galleryAttachments = await prisma.mediaAttachment.findMany({
        where: {
          attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
          attachableId: source.id,
          role: MEDIA_ATTACHMENT_ROLE.GALLERY,
        },
        orderBy: { order: 'asc' },
      })

      const slug = await generateDuplicateSlug(source.slug)
      const techStack = source.technologies.map((row) => row.technology.name)

      const project = await prisma.$transaction(async (tx) => {
        const order = await tx.project.count()

        const created = await tx.project.create({
          data: {
            slug,
            featured: false,
            isPlaceholder: source.isPlaceholder,
            name: `${source.name} (Copy)`,
            category: source.category,
            heroEyebrow: source.heroEyebrow,
            tagline: source.tagline,
            description: source.description,
            github: source.github,
            liveDemo: source.liveDemo,
            demoLabel: source.demoLabel,
            demoHref: source.demoHref,
            screenshot: source.screenshot,
            screenshotMediaId: source.screenshotMediaId,
            architectureImage: source.architectureImage,
            ragPipelineImage: source.ragPipelineImage,
            metrics: toJson(source.metrics),
            overview: source.overview,
            problem: source.problem,
            architecture: source.architecture,
            implementation: source.implementation,
            challenges: source.challenges,
            lessonsLearned: source.lessonsLearned,
            futureImprovements: source.futureImprovements,
            gallery: toJson(source.gallery),
            overviewTitle: source.overviewTitle,
            problemTitle: source.problemTitle,
            techStackTitle: source.techStackTitle,
            architectureTitle: source.architectureTitle,
            implementationTitle: source.implementationTitle,
            challengesTitle: source.challengesTitle,
            lessonsLearnedTitle: source.lessonsLearnedTitle,
            futureImprovementsTitle: source.futureImprovementsTitle,
            galleryTitle: source.galleryTitle,
            videoTitle: source.videoTitle,
            liveDemoTitle: source.liveDemoTitle,
            showOverview: source.showOverview,
            showProblem: source.showProblem,
            showTechStack: source.showTechStack,
            showArchitecture: source.showArchitecture,
            showImplementation: source.showImplementation,
            showChallenges: source.showChallenges,
            showLessonsLearned: source.showLessonsLearned,
            showFutureImprovements: source.showFutureImprovements,
            showGallery: source.showGallery,
            showVideo: source.showVideo,
            showLiveDemo: source.showLiveDemo,
            showMetrics: source.showMetrics,
            showArchitectureImage: source.showArchitectureImage,
            showRagPipelineImage: source.showRagPipelineImage,
            order,
          },
        })

        if (techStack.length > 0) {
          const technologyIds = await resolveTechnologyIds(tx, techStack)
          await tx.projectTechnology.createMany({
            data: technologyIds.map((technologyId, index) => ({
              projectId: created.id,
              technologyId,
              order: index,
            })),
          })
        }

        if (galleryAttachments.length > 0) {
          await tx.mediaAttachment.createMany({
            data: galleryAttachments.map((attachment) => ({
              mediaId: attachment.mediaId,
              attachableType: MEDIA_ATTACHABLE_TYPE.PROJECT,
              attachableId: created.id,
              role: MEDIA_ATTACHMENT_ROLE.GALLERY,
              caption: attachment.caption,
              order: attachment.order,
            })),
          })
        }

        await recordAuditEvent({ action: 'create', entity: 'Project', entityId: created.id })

        return tx.project.findUniqueOrThrow({ where: { id: created.id }, include: PROJECT_INCLUDE })
      })

      await syncProjectGalleryJson(project.id)

      return project
    },
    'duplicate-project',
  )
}
