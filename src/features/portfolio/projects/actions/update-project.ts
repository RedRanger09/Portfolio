'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { MutationNotFoundError, type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { toJson } from '@/lib/prisma-json'
import { resolveTechnologyIds } from '@/lib/technology-resolver'
import { PROJECT_INCLUDE, type ProjectRow } from '../data'
import { assertUniqueProjectSlug } from '../lib/project-slug'
import { resolveProjectScreenshotWrite } from '../lib/project-screenshot'
import { updateProjectSchema } from '../schemas/project.schema'

/**
 * Partially updates an existing `Project`. Only the fields present in
 * `input` are written — every field but `id` is optional
 * (`updateProjectSchema` is `createProjectSchema.partial()`), so a caller
 * can patch just `featured`, for example, without resending the whole
 * project. `techStack`, when provided, replaces the entire ordered set of
 * `ProjectTechnology` rows (delete-then-recreate, same reasoning as
 * `update-contact-information.ts`'s `SocialLink` handling) inside the
 * same transaction as the parent row update.
 */
export async function updateProject(input: unknown): Promise<MutationResult<ProjectRow>> {
  await assertAdminAccess()

  return runMutation(
    updateProjectSchema,
    input,
    async (data) => {
      const { id, techStack, demo, github, liveDemo, architectureImage, ragPipelineImage, metrics, gallery, screenshot, screenshotMediaId, heroEyebrow, ...rest } = data

      const screenshotWrite =
        screenshot !== undefined || screenshotMediaId !== undefined
          ? await resolveProjectScreenshotWrite({ screenshot, screenshotMediaId })
          : null

      const project = await prisma.$transaction(async (tx) => {
        const existing = await tx.project.findUnique({ where: { id }, select: { id: true } })
        if (!existing) {
          throw new MutationNotFoundError(`Project "${id}" does not exist.`)
        }

        if (rest.slug !== undefined) {
          await assertUniqueProjectSlug(rest.slug, id)
        }

        await tx.project.update({
          where: { id },
          data: {
            ...rest,
            ...(screenshotWrite && {
              screenshot: screenshotWrite.screenshot,
              screenshotMediaId: screenshotWrite.screenshotMediaId ?? null,
            }),
            ...(heroEyebrow !== undefined && { heroEyebrow: heroEyebrow.trim() || null }),
            ...(github !== undefined && { github: github || null }),
            ...(liveDemo !== undefined && { liveDemo: liveDemo || null }),
            ...(architectureImage !== undefined && { architectureImage: architectureImage || null }),
            ...(ragPipelineImage !== undefined && { ragPipelineImage: ragPipelineImage || null }),
            ...(demo !== undefined && { demoLabel: demo?.label ?? null, demoHref: demo?.href || null }),
            ...(metrics !== undefined && { metrics: toJson(metrics) }),
            ...(gallery !== undefined && { gallery: toJson(gallery) }),
          },
        })

        if (techStack !== undefined) {
          await tx.projectTechnology.deleteMany({ where: { projectId: id } })
          if (techStack.length > 0) {
            const technologyIds = await resolveTechnologyIds(tx, techStack)
            await tx.projectTechnology.createMany({
              data: technologyIds.map((technologyId, index) => ({ projectId: id, technologyId, order: index })),
            })
          }
        }

        // TODO(audit): once the audit system exists, this call starts writing real rows.
        await recordAuditEvent({ action: 'update', entity: 'Project', entityId: id })

        return tx.project.findUniqueOrThrow({ where: { id }, include: PROJECT_INCLUDE })
      })

      return project
    },
    'update-project',
  )
}
