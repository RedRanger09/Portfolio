'use server'

import { assertAdminAccess } from '@/lib/auth'
import { recordAuditEvent } from '@/lib/audit-placeholder'
import { type MutationResult, runMutation } from '@/lib/mutation-result'
import { prisma } from '@/lib/prisma'
import { getAiConfigurationForAdmin } from '../data'
import { updateAiConfigurationSchema } from '../schemas/ai-configuration.schema'

export async function updateAiConfiguration(input: unknown): Promise<MutationResult<Awaited<ReturnType<typeof getAiConfigurationForAdmin>>>> {
  await assertAdminAccess()

  return runMutation(updateAiConfigurationSchema, input, async (data) => {
    const existing = await getAiConfigurationForAdmin()

    const config = await prisma.aiConfiguration.update({
      where: { id: existing.id },
      data,
    })

    await recordAuditEvent({ action: 'update', entity: 'AiConfiguration', entityId: config.id })
    return config
  }, 'update-ai-configuration')
}
