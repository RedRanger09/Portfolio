/**
 * Centralized environment variable access — the only file in the app that
 * reads `process.env` directly. Every consumer imports the typed `env`
 * object below, never `process.env.X`.
 *
 * Two layers, on purpose:
 *   1. `envSchema` (Zod) parses and validates the raw `process.env` once,
 *      at module load. A malformed value (wrong URL shape, empty string
 *      where a real key was clearly intended) fails fast with a readable
 *      error instead of surfacing later as a confusing Prisma/Cloudinary
 *      error deep in a request.
 *   2. `Env` / `env` is the camelCase, documented shape every call site
 *      already depends on (`env.databaseUrl`, `env.appUrl`, ...). Adding
 *      Zod only changed this file's internals — no call site elsewhere in
 *      the app changed.
 *
 * Almost everything below is `.optional()` deliberately: Cloudinary,
 * Resend, OpenAI, and Clerk aren't integrated yet (see `@future` tags), and
 * `DATABASE_URL`/`DIRECT_URL` are real but not yet pointed at a live Neon
 * project. None of these are required for the app to build or run
 * today — `lib/db-health.ts` and the `lib/{cloudinary,resend,ai}.ts`
 * placeholders are what fail loudly, and only when something actually
 * *uses* an unconfigured service, not at startup. Zod's job here is
 * "reject garbage if it's set", not "require every future integration up
 * front".
 *
 * Naming: `NEXT_PUBLIC_*` vars are inlined into the client bundle by
 * Next.js — never put secrets behind that prefix. Everything else here is
 * server-only, and this module is never imported from a Client Component.
 */

import { z } from 'zod'
import { SITE } from './site.config'

const envSchema = z.object({
  // Public site URL — canonical links, OG metadata, sitemap generation.
  // Falls back to `SITE.siteUrl` (single source of truth) until this is
  // set in production.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Pooled Postgres connection string (Neon's PgBouncer-compatible pooler).
  // Used by `lib/prisma.ts` at runtime. See
  // `docs/infrastructure/database-and-storage.md §1.2`.
  DATABASE_URL: z.string().url().startsWith('postgres').optional(),
  // Direct, unpooled Postgres connection string — required by Prisma
  // Migrate/introspection once `prisma/schema.prisma` has models. Not used
  // by the running application itself.
  DIRECT_URL: z.string().url().startsWith('postgres').optional(),

  // @future Clerk authentication — Admin Dashboard.
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),

  // @future Cloudinary — project screenshots, certificate images.
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  // @future Resend — contact form / resume-request emails.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // @future AI Assistant (OpenAI — gpt-4o-mini + text-embedding-3-small).
  OPENAI_API_KEY: z.string().min(1).optional(),

  // @future Google Analytics.
  GOOGLE_ANALYTICS_ID: z.string().min(1).optional(),
})

/**
 * Parsed once at module load (so a broken `.env.local` fails immediately,
 * on the very first import, not on whichever request happens to touch it
 * first). `safeParse` — not `parse` — purely so the failure path below can
 * throw one clearly formatted error instead of Zod's default multi-line
 * `ZodError` dump.
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(
      `Invalid environment variables:\n${issues}\n\nCheck .env.local against .env.example and fix the values above.`,
    )
  }

  return result.data
}

const parsed = parseEnv()

export interface Env {
  /** Public site URL — canonical links, OG metadata, sitemap generation. */
  appUrl: string

  /**
   * Pooled Postgres connection string (Neon's PgBouncer-compatible pooler).
   * Used by `lib/prisma.ts` at runtime. See
   * `docs/infrastructure/database-and-storage.md §1.2`.
   */
  databaseUrl?: string
  /**
   * Direct, unpooled Postgres connection string. Required by Prisma
   * Migrate/introspection once `prisma/schema.prisma` has models — a
   * transaction-mode pooler like Neon's isn't reliable for those commands.
   * Not used by the running application itself.
   */
  directUrl?: string

  /** @future Clerk secret key (server-only) — Admin Dashboard auth. */
  clerkSecretKey?: string
  /** @future Clerk publishable key (safe for the client bundle). */
  clerkPublishableKey?: string

  /** @future Cloudinary cloud name — project screenshots, certificate images. */
  cloudinaryCloudName?: string
  /** @future Cloudinary API key — required to sign upload requests. */
  cloudinaryApiKey?: string
  /** @future Cloudinary API secret (server-only) — signs upload requests, never sent to the client. */
  cloudinaryApiSecret?: string

  /** @future Resend API key — contact form / resume-request emails. */
  resendApiKey?: string
  /** @future Verified "from" address for transactional email. */
  resendFromEmail?: string

  /** @future OpenAI API key — AI Assistant chat (gpt-4o-mini) + embeddings (text-embedding-3-small). */
  openaiApiKey?: string

  /** @future Google Analytics measurement ID. */
  googleAnalyticsId?: string
}

export const env: Env = {
  appUrl: parsed.NEXT_PUBLIC_APP_URL ?? SITE.siteUrl,

  databaseUrl: parsed.DATABASE_URL,
  directUrl: parsed.DIRECT_URL,

  clerkSecretKey: parsed.CLERK_SECRET_KEY,
  clerkPublishableKey: parsed.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

  cloudinaryCloudName: parsed.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.CLOUDINARY_API_SECRET,

  resendApiKey: parsed.RESEND_API_KEY,
  resendFromEmail: parsed.RESEND_FROM_EMAIL,

  openaiApiKey: parsed.OPENAI_API_KEY,

  googleAnalyticsId: parsed.GOOGLE_ANALYTICS_ID,
}
