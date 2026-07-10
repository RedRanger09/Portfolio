/**
 * Zod counterpart to `src/shared/types/common.ts` — validation for the one
 * value type genuinely shared by more than one feature's mutation schemas
 * (`AccentColor`: Hero's interest cards, Skills, Journey). Everything
 * else stays local to the feature that owns it, same rule
 * `src/lib/prisma-enum-mappers.ts` follows on the read side. See
 * `docs/infrastructure/phase-5-4-implementation-notes.md`.
 */

import { z } from 'zod'

export const accentColorSchema = z.enum(['purple', 'emerald', 'cyan', 'amber', 'pink'])
