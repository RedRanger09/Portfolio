'use server'

import { assertAdminAccess } from '@/lib/auth-placeholder'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { toJson } from '@/lib/prisma-json'
import { resolveTechnologyIds } from '@/lib/technology-resolver'
import { PROJECT_INCLUDE, type ProjectRow } from '../data'
import { createProjectSchema } from '../schemas/project.schema'

/**
 * Creates a new `Project`, resolving `techStack` names to `Technology`
 * rows (creating any that don't exist yet) and writing the ordered
 * `ProjectTechnology` join rows — a project plus N join rows (plus
 * possibly new `Technology` rows) is exactly the "multiple writes that
 * must succeed together" case `docs/infrastructure/phase-5-4-implementation-notes.md`'s
 * transaction rule calls for.
 */
export async function createProject(input: unknown): Promise<MutationResult<ProjectRow>> {
  // TODO(auth, Phase 6): only an authenticated admin may reach this point.
  await assertAdminAccess()

  return runMutation(
    createProjectSchema,
    input,
    async (data) => {
      const project = await prisma.$transaction(async (tx) => {
        const order = data.order ?? (await tx.project.count())

        const created = await tx.project.create({
          data: {
            slug: data.slug,
            featured: data.featured,
            isPlaceholder: data.isPlaceholder,
            name: data.name,
            category: data.category,
            tagline: data.tagline,
            description: data.description,
            github: data.github || null,
            liveDemo: data.liveDemo || null,
            demoLabel: data.demo?.label ?? null,
            demoHref: data.demo?.href ?? null,
            screenshot: data.screenshot,
            architectureImage: data.architectureImage || null,
            ragPipelineImage: data.ragPipelineImage || null,
            metrics: toJson(data.metrics),
            overview: data.overview,
            problem: data.problem,
            architecture: data.architecture,
            implementation: data.implementation,
            challenges: data.challenges,
            lessonsLearned: data.lessonsLearned,
            futureImprovements: data.futureImprovements,
            gallery: toJson(data.gallery),
            order,
          },
        })

        if (data.techStack.length > 0) {
          const technologyIds = await resolveTechnologyIds(tx, data.techStack)
          await tx.projectTechnology.createMany({
            data: technologyIds.map((technologyId, index) => ({
              projectId: created.id,
              technologyId,
              order: index,
            })),
          })
        }

        // TODO(audit): once the audit system exists, this call starts writing real rows.
        await recordAuditEvent({ action: 'create', entity: 'Project', entityId: created.id })

        return tx.project.findUniqueOrThrow({ where: { id: created.id }, include: PROJECT_INCLUDE })
      })

      return project
    },
    'create-project',
  )
}
