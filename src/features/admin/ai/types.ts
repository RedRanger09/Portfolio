import type { AiConfiguration } from '@prisma/client'

export interface AiEditorValues {
  provider: string
  chatModel: string
  embeddingModel: string
  temperature: number
  maxTokens: number
  embeddingDimensions: number
  systemPrompt: string
  chatbotPrompt: string
}

export function mapAiRowToEditorValues(row: AiConfiguration): AiEditorValues {
  return {
    provider: row.provider,
    chatModel: row.chatModel,
    embeddingModel: row.embeddingModel,
    temperature: row.temperature,
    maxTokens: row.maxTokens,
    embeddingDimensions: row.embeddingDimensions,
    systemPrompt: row.systemPrompt,
    chatbotPrompt: row.chatbotPrompt,
  }
}
