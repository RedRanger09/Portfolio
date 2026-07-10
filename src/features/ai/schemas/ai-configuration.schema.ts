import { z } from 'zod'

export const updateAiConfigurationSchema = z.object({
  provider: z.string().min(1).max(40),
  chatModel: z.string().min(1).max(80),
  embeddingModel: z.string().min(1).max(80),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(128).max(32_000),
  embeddingDimensions: z.number().int().min(256).max(4096),
  systemPrompt: z.string().min(1).max(10_000),
  chatbotPrompt: z.string().min(1).max(10_000),
})
