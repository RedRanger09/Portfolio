/**
 * AI Assistant configuration placeholder.
 *
 * The OpenAI SDK is NOT installed yet — nothing in this file calls an LLM.
 * `CHAT_MODEL`/`EMBEDDING_MODEL` are fixed here (not read from an env var)
 * because they're an architecture decision already made and recorded in
 * `docs/infrastructure/infrastructure-overview.md §4` — resolving the two
 * open items `docs/architecture/future-roadmap.md §6` left for Phase 11.
 * `Embedding.vector`'s column dimension (1,536) is locked to
 * `EMBEDDING_DIMENSIONS` the moment that column is first created; changing
 * the model later is a real migration, not a config change, which is
 * exactly why this is a code constant instead of an easily-fat-fingered
 * env var.
 */

import { env } from '@/config/env'

export const CHAT_MODEL = 'gpt-4o-mini'
export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

export interface AiConfig {
  apiKey: string
  chatModel: typeof CHAT_MODEL
  embeddingModel: typeof EMBEDDING_MODEL
}

export function isAiConfigured(): boolean {
  return Boolean(env.openaiApiKey)
}

/**
 * Returns the AI config, or throws a clear, actionable error if it isn't
 * set yet — used once Phase 11 wires up the ingestion pipeline and chat
 * Route Handler (`docs/architecture/future-roadmap.md §1`).
 */
export function getAiConfig(): AiConfig {
  if (!isAiConfigured()) {
    throw new Error('AI Assistant is not configured — set OPENAI_API_KEY in .env.local (see .env.example).')
  }

  return {
    apiKey: env.openaiApiKey!,
    chatModel: CHAT_MODEL,
    embeddingModel: EMBEDDING_MODEL,
  }
}
