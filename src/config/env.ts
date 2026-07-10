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
 * Almost everything below is `.optional()` deliberately so local development
 * and CI builds can run without every integration configured. On Vercel
 * Production (`VERCEL_ENV=production`), `assertProductionEnv()` enforces the
 * variables required for a live deployment — see that function below.
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

  // Clerk authentication — Admin Dashboard.
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().startsWith('/').optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().startsWith('/').optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().startsWith('/').optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().startsWith('/').optional(),
  // Owner email allowed to access `/admin` and mutation Server Actions.
  ADMIN_EMAIL: z.string().email().optional(),

  // Cloudinary — media uploads (server-side).
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  // @future Resend — contact form / resume-request emails.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // @future AI Assistant (OpenAI — gpt-4o-mini + text-embedding-3-small).
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Google Analytics 4 — public measurement ID (G-XXXXXXXX) for client tracking.
  GOOGLE_ANALYTICS_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/i, 'Must be a GA4 measurement ID (G-XXXXXXXX).')
    .optional(),
  // Numeric GA4 property ID for the Data API (Admin → Property settings).
  GA4_PROPERTY_ID: z.string().regex(/^\d+$/, 'Must be a numeric GA4 property ID.').optional(),
  // Service account used by the Analytics Data API (server-only).
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1).optional(),
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

/** Required on Vercel Production — fails fast at cold start instead of mid-request. */
function assertProductionEnv(data: z.infer<typeof envSchema>): void {
  if (process.env.VERCEL_ENV !== 'production') {
    return
  }

  const required = [
    'NEXT_PUBLIC_APP_URL',
    'DATABASE_URL',
    'DIRECT_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'ADMIN_EMAIL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ] as const

  const missing = required.filter((key) => !data[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables:\n${missing.map((key) => `  - ${key}`).join('\n')}\n\nSet them in the Vercel Production environment (see .env.example).`,
    )
  }
}

const parsed = parseEnv()
assertProductionEnv(parsed)

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

  /** Clerk secret key (server-only) — Admin Dashboard auth. */
  clerkSecretKey?: string
  /** Clerk publishable key (safe for the client bundle). */
  clerkPublishableKey?: string
  /** Clerk sign-in path — defaults to `/sign-in`. */
  clerkSignInUrl: string
  /** Clerk sign-up path — defaults to `/sign-up`. */
  clerkSignUpUrl: string
  /** Post sign-in redirect — defaults to `/admin`. */
  clerkAfterSignInUrl: string
  /** Post sign-up redirect — defaults to `/admin`. */
  clerkAfterSignUpUrl: string
  /** Owner email allowed to access the admin area. */
  adminEmail?: string

  /** Cloudinary cloud name — project screenshots, certificate images, media library. */
  cloudinaryCloudName?: string
  /** Cloudinary API key — server-side uploads only. */
  cloudinaryApiKey?: string
  /** Cloudinary API secret (server-only) — never sent to the client. */
  cloudinaryApiSecret?: string

  /** @future Resend API key — contact form / resume-request emails. */
  resendApiKey?: string
  /** @future Verified "from" address for transactional email. */
  resendFromEmail?: string

  /** @future OpenAI API key — AI Assistant chat (gpt-4o-mini) + embeddings (text-embedding-3-small). */
  openaiApiKey?: string

  /** GA4 measurement ID (G-XXXXXXXX) — public site tracking only. */
  googleAnalyticsId?: string
  /** Numeric GA4 property ID for the Analytics Data API. */
  ga4PropertyId?: string
  /** Service account email for the Analytics Data API (server-only). */
  googleServiceAccountEmail?: string
  /** Service account private key PEM for the Analytics Data API (server-only). */
  googleServiceAccountPrivateKey?: string
}

export const env: Env = {
  appUrl: parsed.NEXT_PUBLIC_APP_URL ?? SITE.siteUrl,

  databaseUrl: parsed.DATABASE_URL,
  directUrl: parsed.DIRECT_URL,

  clerkSecretKey: parsed.CLERK_SECRET_KEY,
  clerkPublishableKey: parsed.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSignInUrl: parsed.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  clerkSignUpUrl: parsed.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  clerkAfterSignInUrl: parsed.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? '/admin',
  clerkAfterSignUpUrl: parsed.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? '/admin',
  adminEmail: parsed.ADMIN_EMAIL,

  cloudinaryCloudName: parsed.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: parsed.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: parsed.CLOUDINARY_API_SECRET,

  resendApiKey: parsed.RESEND_API_KEY,
  resendFromEmail: parsed.RESEND_FROM_EMAIL,

  openaiApiKey: parsed.OPENAI_API_KEY,

  googleAnalyticsId: parsed.GOOGLE_ANALYTICS_ID,
  ga4PropertyId: parsed.GA4_PROPERTY_ID,
  googleServiceAccountEmail: parsed.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googleServiceAccountPrivateKey: parsed.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
