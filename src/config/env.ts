/**
 * Centralized environment variable access.
 *
 * Today: plain reads with safe fallbacks. Most of these variables don't
 * exist yet — there's no database, auth provider, or third-party service
 * wired up. They're documented here so the *shape* of configuration is
 * decided now, even though most values are unset.
 *
 * Tomorrow (once Prisma/Clerk/Cloudinary/Resend land): replace the object
 * below with a Zod schema — `envSchema.parse(process.env)` — so the app
 * fails fast at boot with a clear error if a required var is missing,
 * instead of failing confusingly deep inside a query or API route. Every
 * call site (`env.databaseUrl`, `env.clerkSecretKey`, ...) stays identical,
 * so adopting Zod later touches only this file.
 *
 * Naming: `NEXT_PUBLIC_*` vars are inlined into the client bundle by
 * Next.js — never put secrets behind that prefix. Everything else here is
 * server-only by default.
 */

import { SITE } from './site.config'

export interface Env {
  /** Public site URL — canonical links, OG metadata, sitemap generation. */
  appUrl: string

  /** @future Postgres connection string for Prisma. */
  databaseUrl?: string

  /** @future Clerk secret key (server-only) — Admin Dashboard auth. */
  clerkSecretKey?: string
  /** @future Clerk publishable key (safe for the client bundle). */
  clerkPublishableKey?: string

  /** @future Cloudinary cloud name — project screenshots, certificate images. */
  cloudinaryCloudName?: string

  /** @future Resend API key — contact form / resume-request emails. */
  resendApiKey?: string

  /** @future Google Analytics measurement ID. */
  googleAnalyticsId?: string
}

export const env: Env = {
  // Falls back to SITE.siteUrl (single source of truth) until the env var is set in production.
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? SITE.siteUrl,
  databaseUrl: process.env.DATABASE_URL,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  resendApiKey: process.env.RESEND_API_KEY,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
}
