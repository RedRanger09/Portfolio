/**
 * The one execution shape every Server Action in every feature's
 * `actions/` folder returns — Phase 5.4 (`docs/infrastructure/phase-5-4-implementation-notes.md`).
 *
 * A Server Action that throws produces an opaque, unstructured error on
 * the client and — worse — can leak raw Prisma/Postgres error text
 * (constraint names, column names) to whatever eventually calls it. Every
 * mutation in this codebase instead returns a `MutationResult<T>`: a
 * discriminated union callers can branch on with a type guard, never a
 * try/catch around a call site.
 */

import { Prisma } from '@prisma/client'
import type { z } from 'zod'

export type MutationErrorType = 'VALIDATION' | 'NOT_FOUND' | 'DATABASE' | 'UNEXPECTED'

export type MutationError =
  | { type: 'VALIDATION'; message: string; fieldErrors: Record<string, string[]> }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'DATABASE'; message: string }
  | { type: 'UNEXPECTED'; message: string }

export type MutationResult<T> = { success: true; data: T } | { success: false; error: MutationError }

export function mutationSuccess<T>(data: T): MutationResult<T> {
  return { success: true, data }
}

export function mutationFailure<T = never>(error: MutationError): MutationResult<T> {
  return { success: false, error }
}

/**
 * Thrown by a mutation `handler` (inside `runMutation` below) when the
 * row it was asked to update/delete doesn't exist — e.g. `update-project.ts`
 * looks up `id` before writing. `runMutation` catches this and reports it
 * as a `NOT_FOUND` result instead of the `P2025` Prisma error it would
 * otherwise surface as, which reads more like an internal database detail
 * than an expected, nameable outcome.
 */
export class MutationNotFoundError extends Error {}

function fieldErrorsFromZodError(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_root'
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return fieldErrors
}

/** Maps a known Prisma error code to a message safe to show a caller — never the raw Prisma/Postgres text. */
function describePrismaError(error: Prisma.PrismaClientKnownRequestError): string {
  switch (error.code) {
    case 'P2002':
      return 'A record with that value already exists.'
    case 'P2025':
      return 'The record you tried to update or delete no longer exists.'
    case 'P2003':
      return 'This action references a record that does not exist.'
    default:
      return 'A database error occurred. Please try again.'
  }
}

/**
 * Runs `handler` only after `schema.safeParse(input)` succeeds, and
 * normalizes every possible outcome — validation failure, a missing row
 * (`MutationNotFoundError`), a known Prisma error, or anything else — into
 * a `MutationResult`. This is the single call every mutation action in
 * every feature goes through; see `docs/infrastructure/phase-5-4-implementation-notes.md`
 * for why this is the one shared piece of the mutation layer instead of
 * one-off try/catch blocks per action.
 *
 * `input` is deliberately typed `unknown` — the same defensive posture
 * `schema.safeParse` implies. Today's only caller is TypeScript-typed
 * code, but nothing here assumes that stays true once a future admin
 * form (or a raw `FormData` submission) becomes the real caller.
 */
export async function runMutation<TSchema extends z.ZodType, TOutput>(
  schema: TSchema,
  input: unknown,
  handler: (data: z.infer<TSchema>) => Promise<TOutput>,
  label: string,
): Promise<MutationResult<TOutput>> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return mutationFailure({
      type: 'VALIDATION',
      message: 'One or more fields are invalid.',
      fieldErrors: fieldErrorsFromZodError(parsed.error),
    })
  }

  try {
    const data = await handler(parsed.data)
    return mutationSuccess(data)
  } catch (error) {
    if (error instanceof MutationNotFoundError) {
      return mutationFailure({ type: 'NOT_FOUND', message: error.message })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[mutation:${label}] Database error (${error.code}):`, error.message)
      return mutationFailure({ type: 'DATABASE', message: describePrismaError(error) })
    }

    console.error(`[mutation:${label}] Unexpected error:`, error)
    return mutationFailure({ type: 'UNEXPECTED', message: 'Something went wrong. Please try again.' })
  }
}
