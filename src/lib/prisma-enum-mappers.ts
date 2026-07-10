/**
 * Maps between Prisma's generated (SCREAMING_CASE) `AccentColor` enum and
 * the lowercase string literal union the frontend already uses, in both
 * directions. Only `AccentColor` lives here — it's the one enum genuinely
 * shared across features on both the read side (`SkillCategory.accent`,
 * `JourneyMilestone.accent`) and, since Phase 5.4, the write side
 * (`skills`/`journey` mutation actions); every other Prisma enum
 * (`SkillIcon`, `EducationType`, `SocialLinkIcon`, `JourneyIcon`) is only
 * ever touched by the one feature that owns it, so its mapper stays local
 * to that feature's `data.ts`/`actions/` rather than living here — see
 * `docs/infrastructure/phase-5-3-implementation-notes.md`.
 */

import type { AccentColor as PrismaAccentColor } from '@prisma/client'
import type { AccentColor } from '@/shared/types'

const ACCENT_COLOR_MAP: Record<PrismaAccentColor, AccentColor> = {
  PURPLE: 'purple',
  EMERALD: 'emerald',
  CYAN: 'cyan',
  AMBER: 'amber',
  PINK: 'pink',
}

const ACCENT_COLOR_TO_DB: Record<AccentColor, PrismaAccentColor> = {
  purple: 'PURPLE',
  emerald: 'EMERALD',
  cyan: 'CYAN',
  amber: 'AMBER',
  pink: 'PINK',
}

export function mapAccentColor(value: PrismaAccentColor): AccentColor {
  return ACCENT_COLOR_MAP[value]
}

export function mapAccentColorToDb(value: AccentColor): PrismaAccentColor {
  return ACCENT_COLOR_TO_DB[value]
}
