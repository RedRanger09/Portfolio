/**
 * Centralized environment variable access.
 *
 * Phase 5.1 status: `databaseUrl`/`directUrl` are now real and load-bearing
 * — `lib/prisma.ts` depends on them. Every other field remains a
 * documented placeholder for a service that isn't integrated yet
 * (Cloudinary, Resend, the AI provider) — declared here, with an
 * `@future` tag, so the *shape* of configuration is decided before the
 * service arrives, not invented ad hoc when it does.
 *
 * Still a plain object with safe fallbacks, not a Zod schema — see
 * `ARCHITECTURE.md §8` for why that migration is deliberately deferred.
 * `lib/prisma.ts` and `lib/db-health.ts` add their own fail-fast checks
 * specifically for `databaseUrl`, since that's the one variable an
 * incomplete setup can't silently work around.
 *
 * Naming: `NEXT_PUBLIC_*` vars are inlined into the client bundle by
 * Next.js — never put secrets behind that prefix. Everything else here is
 * server-only by default.
 */

import { SITE } from './site.config'

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
  // Falls back to SITE.siteUrl (single source of truth) until the env var is set in production.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? SITE.siteUrl,

  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,

  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,

  openaiApiKey: process.env.OPENAI_API_KEY,

  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
}
