/**
 * Cloudinary configuration placeholder.
 *
 * The Cloudinary SDK is NOT installed yet — nothing in this file talks to
 * Cloudinary. It exists so the *shape* of the eventual client is decided
 * now: every future import site can already write
 * `import { getCloudinaryConfig } from '@/lib/cloudinary'` and that path
 * will still be correct once Phase 8 (`docs/architecture/future-roadmap.md
 * §5`, table row 8) replaces this file's body with a real
 * `cloudinary.config(...)` call and a signed-upload helper — see
 * `docs/infrastructure/database-and-storage.md §2` for that design.
 */

import { env } from '@/config/env'

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret)
}

/**
 * Returns the Cloudinary config, or throws a clear, actionable error if
 * it isn't set yet — used once Phase 8 wires up real upload signing.
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and ' +
        'CLOUDINARY_API_SECRET in .env.local (see .env.example).',
    )
  }

  return {
    cloudName: env.cloudinaryCloudName!,
    apiKey: env.cloudinaryApiKey!,
    apiSecret: env.cloudinaryApiSecret!,
  }
}
