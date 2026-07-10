import { prisma } from '@/lib/prisma'
import { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, isAiConfigured } from '@/lib/ai'

export const DEFAULT_AI_SYSTEM_PROMPT = `You are a helpful assistant for Akshay Tiwari's portfolio. Answer questions about projects, skills, and experience using only grounded context.`

export const DEFAULT_AI_CHATBOT_PROMPT = `You are the portfolio chatbot. Be concise, friendly, and factual. If you do not know something, say so.`

export async function getAiConfigurationForAdmin() {
  const existing = await prisma.aiConfiguration.findFirst()
  if (existing) return existing

  return prisma.aiConfiguration.create({
    data: {
      provider: 'openai',
      chatModel: CHAT_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      temperature: 0.7,
      maxTokens: 1024,
      embeddingDimensions: EMBEDDING_DIMENSIONS,
      systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
      chatbotPrompt: DEFAULT_AI_CHATBOT_PROMPT,
    },
  })
}

export function getAiApiStatus() {
  return {
    configured: isAiConfigured(),
    provider: 'openai' as const,
  }
}
