# Phase 5.4 Implementation Notes — Backend Mutation Layer

Phase 5.3 moved every public portfolio feature onto Prisma reads with a
static fallback. This phase adds the write side: one `create`/`update`/
`delete` Server Action per list entity (Projects, Skills, Journey,
Education, Certifications) and one `update` Server Action per singleton
entity (Hero, About, Resume, Contact) — 22 actions total, all backend-only.
No admin UI, forms, authentication, API routes, or architecture changes.

## Folder changes

Every feature gained two new sibling folders next to its existing
`components/`, `data.ts`, and `types.ts`:

```
features/portfolio/<feature>/
  schemas/<feature>.schema.ts   # Zod — one per feature, not one giant folder
  actions/
    create-<entity>.ts          # 'use server' — list entities only
    update-<entity>.ts          # 'use server' — every feature
    delete-<entity>.ts          # 'use server' — list entities only
    index.ts                    # barrel re-exporting the action(s) above
```

Four new shared, cross-feature files were added under `src/lib/` (the
existing "boundary to an external system" layer — Prisma error codes and
JSON-column casting are exactly that kind of boundary concern, same
reasoning `db-fallback.ts` and `prisma-enum-mappers.ts` already followed
in Phase 5.3):

- `src/lib/mutation-result.ts` — the `MutationResult<T>` type and the
  `runMutation()` runner every single action calls through.
- `src/lib/auth-placeholder.ts` — `assertAdminAccess()`, the future-Clerk
  extension point.
- `src/lib/audit-placeholder.ts` — `recordAuditEvent()`, the future-audit-log
  extension point.
- `src/lib/technology-resolver.ts` — `resolveTechnologyIds()`, shared by
  Projects and Skills (the two features that reference `Technology` by
  name), plus `slugifyTechnologyName()` (also now reused by
  `prisma/seed.ts`, replacing its own local copy).
- `src/lib/prisma-json.ts` — `toJson()`, the same JSON-column cast helper
  `prisma/seed.ts` used locally in Phase 5.3, now shared since mutation
  actions need it too (`Hero.interestCards`/`ctas`, `Project.metrics`/`gallery`).

One feature-agnostic addition: `src/shared/schemas/common.schema.ts`
(`accentColorSchema`) — the Zod counterpart to `src/shared/types/common.ts`'s
`AccentColor`, needed by Hero's interest cards, Skills, and Journey
schemas. `src/lib/prisma-enum-mappers.ts` also gained a second function,
`mapAccentColorToDb()` (App → Prisma direction), alongside the existing
`mapAccentColor()` (Prisma → App) — Skills and Journey actions both need
the write direction now, so it earned the same "shared because 2+ features
need it" treatment its read-side sibling already had.

Every other enum mapper (`SkillIcon`, `EducationType`, `JourneyIcon`,
`SocialLinkIcon`) stays local to the one feature that owns it, following
Phase 5.3's rule exactly — Journey's and Education's `data.ts` each grew
one new exported constant (`JOURNEY_ICON_TO_DB`, `EDUCATION_TYPE_TO_DB`,
the write-direction inverse of the read-side map already there) so the
create/update actions could import it instead of redefining it.

`projects/data.ts` and `skills/data.ts` also exported two previously-private
symbols each (`PROJECT_INCLUDE`/`ProjectRow`, `SKILL_CATEGORY_INCLUDE`/`SkillCategoryRow`)
so the new actions return the exact same shape (with the same `technologies`/`skills`
join included) the read layer already queries — one `include` definition
per entity, not two.

## Action architecture

Every action is a plain exported `async function` in a file starting with
`'use server'`, taking `input: unknown` and returning
`Promise<MutationResult<T>>` — never throwing across the action boundary.
Concretely, every action follows this shape:

```ts
export async function createProject(input: unknown): Promise<MutationResult<ProjectRow>> {
  await assertAdminAccess()          // future-auth placeholder — first line, every action

  return runMutation(createProjectSchema, input, async (data) => {
    // ...typed, validated `data` — Prisma writes go here...
    await recordAuditEvent({ ... }) // future-audit placeholder — after every successful write
    return result
  }, 'create-project')
}
```

`input: unknown` (not the schema's inferred type) is deliberate — the same
defensive posture `schema.safeParse` implies. Today's only caller is
TypeScript-typed code, but nothing assumes that stays true once a real
admin form (or a raw `FormData` submission) becomes the actual caller.

List entities got all three verbs; singletons got only `update`, treated
as an upsert-by-lookup (find the one existing row, update it, or create
it if none exists yet — there's no natural unique key to `upsert()` on,
and no scenario where a second Hero/About/Resume/ContactInformation row
should ever exist). This is a deliberate, documented departure from the
brief's literal `create-project.ts`/`update-project.ts`/`delete-project.ts`
example structure for the four entities where create/delete don't make
conceptual sense.

Each feature's `actions/index.ts` barrels its action(s) for import
convenience (`import { createProject, updateProject, deleteProject } from
'@/features/portfolio/projects/actions'`) — the same barrel convention the
feature's top-level `index.ts` already uses for `components`/`data`/`types`.
That top-level barrel was deliberately **not** extended to re-export
`actions` — keeping "read API" (`@/features/portfolio/projects`, imported
by every Server/Client Component today) and "write API"
(`@/features/portfolio/projects/actions`, imported by nothing yet) as two
separate import paths means nothing on the read side changed, and a future
admin surface opts into the write API explicitly.

## Validation architecture

Each feature owns its schemas in its own `schemas/*.schema.ts` — 9 files,
never one shared validation folder, per the brief. Every schema file
exports `create<Entity>Schema` / `update<Entity>Schema` / `delete<Entity>Schema`
(or just `update<Entity>Schema` for singletons) plus their inferred
`z.infer<...>` input types.

**Update schemas are written as their own explicit `z.object({...})`, not
`createSchema.partial()`.** This was verified directly, not assumed: parsing
`{}` through `z.object({ featured: z.boolean().default(false) }).partial()`
still returns `{ featured: false }` — Zod's `.default()` fires even inside
a `.partial()`-wrapped field when that field is omitted. Deriving update
schemas from `.partial()` on a create schema with `.default()`s (which
several — `featured`, `techStack`, `metrics`, `isCurrent`, …) would have
silently reset those fields to their create-time default on every partial
update that didn't happen to mention them. Every update schema field is
instead `.optional()` with **no** `.default()`, so an omitted field is left
untouched by the action, not overwritten. This is called out at the top of
`projects/schemas/project.schema.ts` and referenced from every other
feature's schema file rather than re-explained nine times.

Business-rule validation lives alongside the field rules where it's
genuinely a validation concern, not a database constraint check: e.g.
`contact.schema.ts`'s `updateContactInformationSchema` uses `.refine()` to
reject duplicate `icon` values across `methods` client-side, ahead of (and
independent from) the DB's own `@@unique([contactInformationId, icon])`.

## Error handling strategy

Every action's only failure surface is the `MutationResult<T>` discriminated
union (`src/lib/mutation-result.ts`):

```ts
type MutationResult<T> =
  | { success: true; data: T }
  | { success: false; error: MutationError }

type MutationError =
  | { type: 'VALIDATION'; message: string; fieldErrors: Record<string, string[]> }
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'DATABASE'; message: string }
  | { type: 'UNEXPECTED'; message: string }
```

`NOT_FOUND` extends the brief's four example categories (Success /
Validation / Database / Unexpected) with one more — a caller trying to
update or delete a row that no longer exists is common and nameable enough
to deserve its own branch rather than surfacing as a generic `DATABASE`
error (Prisma's own `P2025` for this case). It's still handled by the exact
same `runMutation()` path as everything else, not a special case.

`runMutation(schema, input, handler, label)` is the one function every
action calls through, and is the only place any of this logic exists:

1. `schema.safeParse(input)` — on failure, returns `VALIDATION` with a
   `fieldErrors` map built from `error.issues` (same manual
   `issue.path.join('.')` approach `src/config/env.ts` already used for its
   own error formatting, not a Zod `.flatten()`/`.format()` call, to avoid
   depending on an API shape that changed between Zod major versions).
2. Runs `handler(parsedData)` in a `try`/`catch`.
3. A `MutationNotFoundError` thrown by the handler (a small exported
   `Error` subclass) becomes `NOT_FOUND`.
4. A `Prisma.PrismaClientKnownRequestError` becomes `DATABASE`, with the
   raw Prisma/Postgres message logged server-side (`console.error`) but
   never returned to the caller — only a small `switch` over known codes
   (`P2002` unique constraint, `P2025` missing row, `P2003` foreign key)
   produces the caller-facing message, defaulting to a generic "A database
   error occurred" for anything else.
5. Anything else becomes `UNEXPECTED`, also logged server-side, also never
   exposing the raw error to the caller.

No action anywhere has its own try/catch or its own ad hoc error shape —
verified by construction, since every action's body is just a call to
`runMutation(...)`.

## Transaction strategy

Per the brief ("use transactions only where multiple writes must succeed
together, don't overuse them"):

**Used `prisma.$transaction`:**
- `create-project.ts` / `update-project.ts` — writing/replacing the
  `Project` row alongside its `ProjectTechnology` join rows (and any newly
  created `Technology` rows) must be atomic: a project left with half its
  tech stack linked (or a `Technology` row created for a write that then
  fails) is a real, reachable bad state without one.
- `create-skill-category.ts` / `update-skill-category.ts` — identical
  reasoning for `SkillCategory` + `Skill` join rows.
- `update-contact-information.ts` — replacing the singleton row and its
  entire ordered set of `SocialLink` children (delete-then-recreate) in
  one transaction, so a failure partway through can't leave the contact
  section with zero or duplicate social links.

**Not used** (single-statement or single-table writes, where a transaction
would add nothing):
- `delete-project.ts` / `delete-skill-category.ts` — one `delete()`; child
  rows cascade via `onDelete: Cascade` already declared in
  `prisma/schema.prisma`, not application-level cleanup.
- All of Journey, Education, and Certifications' six actions — every one
  is a single-table write with no child rows to keep in sync.
- `update-hero.ts` / `update-about.ts` / `update-resume.ts` — single-table
  upsert-by-lookup; the lookup-then-write isn't multiple *independent*
  writes that need atomicity with each other in the way a parent+children
  write does.

## Future authentication integration

`src/lib/auth-placeholder.ts` exports one function, `assertAdminAccess()`,
currently a documented no-op. Every one of the 22 actions calls it as its
literal first line, before validating input or touching the database —
deliberately per-action (not hidden inside `runMutation`), so a future
action with different permission requirements (e.g. a hypothetical
lower-privilege "editor" role) can swap in a different check without
touching the shared runner every other action also depends on. Wiring up
real Clerk authorization later means editing this one file — the
`// TODO(auth, Phase 6)` comment inside it already sketches the intended
`auth()` call and the new `MutationForbiddenError`/`FORBIDDEN` result type
it would introduce — not any of the 22 call sites.

## Future Admin Dashboard integration

Every action already returns exactly what an admin form needs: typed
success data (the created/updated Prisma row, or `{ id }` for deletes) or
a structured error with field-level messages ready to attach to form
inputs. The intended integration shape, once Phase 6 exists:

```tsx
'use client'
import { createProject } from '@/features/portfolio/projects/actions'

async function onSubmit(formData: FormData) {
  const result = await createProject(Object.fromEntries(formData))
  if (!result.success) {
    if (result.error.type === 'VALIDATION') setFieldErrors(result.error.fieldErrors)
    else setFormError(result.error.message)
    return
  }
  router.push(`/admin/projects/${result.data.id}`)
}
```

No action, schema, or shared helper needs to change to support this —
the mutation layer was built against that exact future shape.

## Reusable patterns introduced

- **`runMutation()`** — the one execution path (validate → run → normalize
  errors) every action in every feature goes through. This is to the write
  side what `withDbFallback()` was to the read side in Phase 5.3: a single
  shared wrapper instead of 22 near-identical try/catch blocks.
- **Explicit (non-`.partial()`) update schemas** — documented once, in
  `project.schema.ts`, and followed by every other feature rather than
  rediscovered per feature.
- **Auth/audit placeholders as real (no-op) functions, not comments** —
  `assertAdminAccess()`/`recordAuditEvent()` are actually called at every
  action's start/end, giving Phase 6 (and the future audit system) one
  real function body to fill in per concern, rather than 22+ scattered
  `// TODO: check auth here` comments that could be missed or drift.
- **`resolveTechnologyIds()`** — the write-side counterpart to
  `prisma/seed.ts`'s technology-dedup pass, shared by the two features
  (Projects, Skills) that reference `Technology` by name.
- **Delete-then-recreate for ordered child collections** — used identically
  by `update-project.ts` (`ProjectTechnology`), `update-skill-category.ts`
  (`Skill`), and `update-contact-information.ts` (`SocialLink`): the caller
  sends the *complete* new ordered set, not a diff, so replacing the whole
  child collection inside the parent's transaction is simpler and no less
  correct than computing an add/remove/reorder diff.

## Production-readiness assessment

**Ready:**
- Type-safe end to end — `npm run typecheck`/`npm run lint`/`npm run build`
  all pass with zero errors or warnings; no `any` anywhere in the new code.
- Every action validates input, handles Prisma and unexpected errors
  uniformly, and never throws across its own boundary.
- Verified live against Neon (see below), not just type-checked: every
  create/update/delete actually reads back correctly, technology
  deduplication works, transactions roll back correctly on invalid input,
  and validation genuinely rejects bad data before touching the database.

**Not ready — by design, deferred to explicitly later phases:**
- **No authorization.** `assertAdminAccess()` is a no-op — anyone who can
  import an action can currently call it. This is safe *only* because
  nothing calls these actions yet (no admin UI, no API routes exposing
  them). This must be wired to real Clerk auth (Phase 6) before any UI or
  route calls into this layer.
- **No audit trail.** `recordAuditEvent()` doesn't persist anything yet.
- **No rate limiting / CSRF-specific hardening beyond what Next.js Server
  Actions already provide by default.**

The mutation *logic* — validation, transactions, error handling — is
production-quality today. The mutation *layer* is not yet safe to expose
to any caller until Phase 6's authorization lands; that boundary is exactly
where this phase stopped on purpose.

## Verification performed

- `npm run typecheck` — zero errors.
- `npm run lint` — zero errors/warnings.
- `npm run build` — succeeds; all existing static pages still prerender
  correctly, confirming the new `actions/` barrels (files with `'use
  server'`) don't interfere with the existing read-side build output.
- A temporary smoke-test script (deleted after use, not part of this
  phase's deliverable) exercised all 22 actions live against Neon: 40
  assertions, 0 failures, covering —
  - Every list entity's create → update → delete cycle, including
    technology resolution/dedup (Projects, Skills) and auto-assigned
    `order`.
  - Every list entity's create rejecting invalid input with a `VALIDATION`
    result.
  - Deleting an already-deleted row returning `NOT_FOUND`, not a thrown
    error or a generic failure.
  - Every singleton's `update` action round-tripped with its own current
    data (verifying the write path end-to-end without altering seeded
    content) and rejected invalid input.
  - `updateContactInformation`'s transaction verified to replace
    `SocialLink` rows 1:1 with the new `methods` array.
- Post-test row counts (`Project` 5, `SkillCategory` 5, `JourneyMilestone`
  11, `Education` 2, `Certification` 5) confirmed identical to the
  pre-test seeded state, and the test-only `"SmokeTestTech"` `Technology`
  row confirmed cleaned up — the database was left exactly as Phase 5.3
  seeded it.
