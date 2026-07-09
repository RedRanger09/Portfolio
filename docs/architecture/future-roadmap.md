# Future Roadmap

> Companion to [`system-overview.md`](./system-overview.md),
> [`domain-model.md`](./domain-model.md), [`database-design.md`](./database-design.md),
> and [`cms-design.md`](./cms-design.md). This document covers the two
> features complex enough to need their own design pass (AI Assistant,
> GitHub integration, Resume generator), the phased plan for building
> everything in this document set, and the final architecture review.

## 1. AI / RAG architecture

### 1.1 Goal

A visitor-facing chatbot that answers questions about Akshay — his
projects, skills, background, and blog — grounded in the platform's own
content (retrieval-augmented generation), not the LLM's general knowledge
alone. Every answer should be traceable to specific `KnowledgeSource` rows.

### 1.2 Components

```
┌───────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Content        │────►│  Ingestion         │────►│  KnowledgeSource   │
│  (Project,       │ on  │  pipeline           │     │  + Embedding       │
│   BlogPost, ...) │pub  │  (extract, chunk,   │     │  (pgvector)        │
└───────────────┘lish │   embed)            │     └─────────┬──────────┘
                       └──────────────────┘               │
                                                             │ similarity search
┌───────────────┐     ┌──────────────────┐     ┌───────────▼──────────┐
│  Visitor        │────►│  Chat Route        │────►│  Retrieval             │
│  (asks a        │     │  Handler           │     │  (top-K chunks)        │
│   question)     │     │  (streams reply)   │     └───────────┬──────────┘
└───────────────┘     └────────┬─────────┘                 │
                                 │                             │
                                 │        ┌────────────────────┘
                                 ▼        ▼
                        ┌──────────────────────┐
                        │  LLM (prompt =         │
                        │  PromptTemplate +       │
                        │  retrieved chunks +     │
                        │  conversation history)  │
                        └──────────┬────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  Message (persisted,   │
                        │  cites KnowledgeSource  │
                        │  IDs used)              │
                        └──────────────────────┘
```

### 1.3 Retrieval flow, step by step

1. Visitor submits a question to `POST /api/ai/chat`.
2. The question is embedded using the platform's **active** embedding model
   (`FeatureFlag.activeEmbeddingModel` — `database-design.md §9.1`).
3. A pgvector cosine-similarity query returns the top-K (proposed: 5–8)
   `Embedding` rows whose `model` matches the active model.
4. Each result's parent `KnowledgeSource` is fetched (deduplicated — several
   top chunks may share a source).
5. A prompt is assembled: the active `PromptTemplate.content` (system
   instructions — tone, scope, what to do if the answer isn't in the
   sources) + the retrieved chunks (with light citation markers) + the last
   N turns of the current `Conversation` (short-term memory) + the new question.
6. The LLM streams a response back to the client via the Route Handler.
7. On completion, a `Message` row is persisted with `role: ASSISTANT`,
   `content`, and `retrievedKnowledgeSourceIds` — enabling a "sources used"
   UI affordance and, separately, offline quality review in the AI Assistant
   admin module (`cms-design.md §4`).

### 1.4 Document ingestion & knowledge sources

Ingestion is **event-driven, not a standing crawler**: it fires when a
Publishable entity transitions to `PUBLISHED` (`database-design.md §3`),
directly tying "this is live on the site" to "this is knowledge the
assistant can cite" — an editorial choice as much as a technical one; a
draft should never leak into chatbot answers.

```
Admin clicks "Publish" on a Project
        │
        ▼
Server Action: publishProject()
        │
        ├─► Project.status = PUBLISHED, publishedAt set
        ├─► ContentVersion snapshot written
        └─► enqueue: reindexKnowledgeSource({ sourceType: 'PROJECT', sourceId })
                │
                ▼
        lib/ai/ingestion.ts
                │
                ├─► extract plain text from the Project's fields
                │   (name, tagline, description, tech stack, metrics)
                ├─► upsert KnowledgeSource (by sourceType+sourceId)
                ├─► chunk the text (proposed: ~500 tokens/chunk, slight overlap)
                ├─► delete this source's previous Embedding rows for the
                │   *active* model (keep other models' rows untouched —
                │   database-design.md §9.1)
                └─► generate + insert new Embedding rows
```

**`MANUAL` knowledge sources** (`sourceId: null`) exist for facts that don't
correspond to any single content row — "What's Akshay currently studying?",
"Is Akshay open to internships?" — entered directly by the admin in the AI
Assistant module as freeform Q&A-shaped text, ingested the same way.

**Reconciliation job** (periodic, low-frequency — e.g. daily via the same
Vercel Cron mechanism as reindexing): finds `KnowledgeSource` rows whose
`sourceId` no longer resolves to a live, published row (source was
hard-deleted or unpublished) and soft-deletes them — the cleanup half of the
soft-reference tradeoff accepted in `database-design.md §9.3`.

### 1.5 Conversation memory

- **Short-term (v1):** the last N messages of the current `Conversation`
  are passed verbatim as context on every turn — sufficient for a portfolio
  Q&A assistant where sessions are short and don't need cross-session recall.
- **Long-term (deferred, v2 idea, not designed further here):** summarizing
  a completed `Conversation` and storing the summary back as a `MANUAL`-like
  `KnowledgeSource` (`sourceType: CONVERSATION_SUMMARY`) so recurring
  questions/feedback patterns could theoretically inform future answers.
  Flagged as an idea, deliberately not committed to a schema now — it would
  reuse the existing `KnowledgeSource` shape without modification if pursued.

### 1.6 Cost & failure posture

- The AI subsystem must degrade gracefully: if the LLM provider is down or
  a rate limit is hit, the chat UI shows a clear error, and **nothing else
  on the platform is affected** — reaffirming `system-overview.md §1.2`,
  principle 8.
- `Message.tokensUsed` is captured per turn specifically so a future
  cost-tracking view in the AI Assistant module is a `SUM(tokensUsed)` query
  away, not a new integration with the LLM provider's billing API.

## 2. GitHub integration

Two distinct features, intentionally scoped differently:

### 2.1 Read-only repo enrichment (near-term, low-risk)

Displaying live stats (stars, last-updated, primary language) for a
Project's linked GitHub repo. Implementation shape: a cached snapshot,
**not** a live API call on every page render (avoids hammering GitHub's
rate limits and keeps the public page's render fast and independent of
GitHub's uptime).

- A `githubMetadata (jsonb)` column on `Project` (or, if it needs its own
  refresh timestamp and provenance, a small `GithubMetadataSnapshot` table
  keyed by `projectId`) holds the last-fetched stats.
- A periodic job (same Vercel Cron pattern as AI reindexing) refreshes it
  for every Project with a `github` `ProjectLink`.
- No new bounded context needed — this is a caching detail on an existing
  entity, not a new domain concept.

### 2.2 Repo-to-draft-project ingestion (aspirational, v2+)

The bigger idea — "detect a new pinned repo and draft a Project from it
automatically" — needs a webhook or polling subscription, a mapping from
GitHub's README/metadata to the `Project` shape, and human review before
publish (it should **always** land in `DRAFT`, never auto-publish). If
pursued, it would need its own `GithubSyncLog` (what was ingested, when,
which draft it produced) for traceability. **Explicitly deferred** — flagged
here as a real idea worth having, not a near-term commitment, because the
draft/publish workflow in `database-design.md §3` already provides the
safety rail (auto-created content is inert until a human approves it) this
feature would need.

## 3. Resume generator

Two designs considered:

| | **A. Curated PDF (today's approach, versioned)** | **B. Fully generated resume** |
|---|---|---|
| How it works | An admin uploads a PDF they designed elsewhere; `ResumeVersion` tracks it. | `ResumeSection` rows curate which `Project`/`Education`/`WorkExperience`/`Certificate` entries appear, in what order; a template renders them to PDF/HTML on demand. |
| Risk | Very low — this is what exists today, just versioned. | Higher — needs a rendering pipeline (React-PDF, or HTML→PDF), a resume-specific layout design, and content curation UX. |
| Payoff | Resume always looks exactly as designed. | Resume can be regenerated instantly whenever CMS content changes — no more "forgot to update the PDF" drift. Could integrate with the AI assistant to draft bullet-point phrasing from Project descriptions. |

**Recommendation: ship A now (already designed — `domain-model.md §7`), keep
B as an explicitly named future feature, not a commitment.** The
`ResumeSection` entity is included in the domain model specifically so this
decision doesn't require a schema change whenever it's greenlit — it's
sitting there, unused, until it's needed.

## 4. Visitor analytics — product angle

(Schema: `database-design.md §6`.) The product surface is the Analytics
admin module (`cms-design.md §4`): top pages, referrer sources, resume
download counts, and — once the AI assistant ships — conversation volume
and common-question trends (aggregated from `Message.content`, not
individually reviewed by default, to keep this a product-insight feature
rather than a surveillance one). No consent banner is required under the
current no-PII design (`database-design.md §6.1`); if a future
requirement adds PII (e.g. tying analytics to authenticated newsletter
subscribers), that decision must revisit this posture explicitly — flagged
in §6 below as a watch item, not a current requirement.

## 5. Phased delivery plan

Builds on Phases 1–3 (already complete — Next.js/TypeScript migration,
application shell, full public-portfolio UI migration).

| Phase | Scope | Depends on |
|---|---|---|
| **4** | Prisma schema authored 1:1 from `domain-model.md`; local Postgres running; `prisma/seed.ts` imports today's static `data.ts` arrays. No app code changes yet — the schema exists and is seeded, proving the model out, before anything reads from it. | This document set |
| **5** | `lib/prisma.ts`; each feature's `data.ts` function bodies swap from static arrays to Prisma queries, one feature at a time (Projects first — highest-value proof point). Public site now reads from Postgres. Connection pooling decided and configured (§6). | Phase 4 |
| **6** | Clerk integration: `middleware.ts`, Clerk webhook → local `User` sync, RBAC tables seeded with the four default roles (`database-design.md §5.1`). `(admin)` route group scaffolded with a Dashboard home and auth gate — no content modules yet. | Phase 5 |
| **7** | Admin CRUD for Projects, Skills, Education/Experience, Certificates — the modules mirroring content that already exists publicly. Draft/Publish workflow live. `ContentVersion`/`AuditLog` wired via Prisma middleware. | Phase 6 |
| **8** | Cloudinary integration; Media Library module; `MediaAttachment`/direct-FK image slots migrated off static `public/` assets. | Phase 7 |
| **9** | Blog and Research features built (mirrors `portfolio/` shape — `system-overview.md §5`); their admin modules. Public `/blog`, `/research` routes. | Phase 7, 8 |
| **10** | Contact form goes live end-to-end (public write path, `database-design.md §8`) + Messages admin module. Visitor analytics ingestion (`Visitor`/`PageView`/`Event`) begins. | Phase 6 |
| **11** | AI subsystem: `KnowledgeSource`/`Embedding` tables, ingestion pipeline (§1.4), chat Route Handler, AI Assistant admin module. | Phases 7–10 (needs published content to index) |
| **12+** | GitHub read-only enrichment, resume generator (Option B, if greenlit), long-term conversation memory, analytics rollups/retention automation. | Phase 11 |

Each phase ends with the same discipline established in Phases 1–3:
`tsc --noEmit`, `eslint`, `next build` all clean before moving on, plus
(starting Phase 5, once there's a database) a migration review step.

## 6. Decisions needed before Phase 5

Explicit, named gaps this document set intentionally leaves open —
answering these is the concrete unblocking work before implementation starts:

1. **Postgres hosting provider and connection pooling strategy**
   (`database-design.md §11`) — Neon vs. Supabase vs. RDS vs. Railway;
   whichever is chosen, confirm its pooling story before Phase 5, not after
   a production outage.
2. **Soft-delete retention window** (`database-design.md §4`) — proposed 90
   days; needs an explicit decision, not just a proposal, since it
   determines when the hard-delete job is safe to enable.
3. **Analytics raw-row retention window** (`database-design.md §6.2`) —
   proposed 6–12 months; same status.
4. **Embedding model choice and dimension** — affects `Embedding.vector`'s
   column dimension at creation time; changing it later means a genuine
   migration (new column, backfill, cutover), not just a `FeatureFlag` flip.
   Decide before the first `Embedding` row is ever written.
5. **Rich text storage format for `BlogPost.content`** — MDX (files or DB
   text?) vs. a structured block-based JSON (Portable Text-style) vs. plain
   Markdown. Affects the editor UI's complexity and whether content can
   embed interactive components. Not decided in this document set because
   it's as much a CMS-editor UX decision as a schema one.
6. **Rate-limiting mechanism for the public contact form and AI chat
   endpoint** (`database-design.md §8`) — Upstash Redis, Vercel's built-in
   options, or an in-memory approach (only viable if single-instance —
   confirm deployment topology first).
7. **Multi-Owner support** — the domain model assumes exactly one `Owner`
   (`domain-model.md §3`); if Akshay ever wants a co-owner (e.g. a business
   partner), `User.isOwner` as a single boolean needs revisiting before
   that's needed, not during.

## 7. Scalability re-assessment

Re-examining the domain model against each future identity the platform
might grow into — the deliverable this document set exists to answer:
**does this still scale?**

| Platform becomes... | Assessment |
|---|---|
| **A CMS** | Yes, comfortably. Content volumes (projects, skills, certificates) are in the tens/hundreds. The Publishable/Versionable/Auditable patterns (`database-design.md §2`) are exactly what a CMS needs and don't get more expensive as content grows linearly. |
| **A Blog** | Yes. Blog posts will number in the hundreds over 5 years at a realistic personal-writing cadence; Postgres full-text search (`system-overview.md §4.8`) handles that scale with no additional infrastructure. Revisit only if post volume grows by 100x. |
| **An AI Assistant** | Yes, with the explicit caveat that the bottleneck will be **LLM API latency and cost**, not the database — pgvector at a few thousand embeddings is nowhere near its performance ceiling (`system-overview.md §4.7`). The architecture correctly treats the vector store as the *least* likely thing to need replacing. |
| **A Research Portal** | Yes — publication/research-project volume is lower than blog volume; the `Author`/`PublicationAuthor` join already supports the "same co-author across multiple papers" case a research portal needs without modification. |

**Where scale risk actually lives** (worth stating plainly, since it's not
where "scale" conversations usually look): **not data volume — operational
complexity.** The real five-year risks are (a) LLM cost as usage grows, (b)
keeping `KnowledgeSource.extractedText` genuinely in sync with source
content as more content types get indexed, and (c) the audit/versioning
system generating enough rows that its own retention policy (§6, item 2/3)
needs to actually be operated, not just designed. None of these are solved
by a "bigger database" — they're solved by the operational decisions in §6
being made and revisited on schedule.

## 8. Final architecture review

### 8.1 Architecture Readiness Score: **8.5 / 10**

**What earns the 8.5:** every entity in `domain-model.md` maps to a real,
named need (nothing speculative bolted on "just in case"); the six
cross-cutting patterns (`database-design.md §2`) mean the schema is a
*system* of consistent rules, not fifty one-off tables; the single-writer
principle and the additive-not-critical-path treatment of AI/analytics
(`system-overview.md §1.2`) directly protect the platform's most important
property — the public portfolio must never break because an experimental
subsystem broke; and every major technology choice has a documented
alternative, tradeoff, and reversal path (`system-overview.md §4`), which is
what "designed for five years" actually requires — not that every choice is
permanent, but that every choice is *changeable without a rewrite*.

**What keeps it from a 10:** the seven items in §6 are genuine open
decisions, not yet resolved — this is architecture, not implementation, and
those decisions materially affect implementation (a wrong embedding
dimension choice, in particular, is expensive to reverse). Docking 1.5
points for "real, named, unresolved decisions" rather than treating the
score as a formality.

### 8.2 Risks

| Risk | Severity | Mitigation already in place | Residual action |
|---|---|---|---|
| Polymorphic associations (Taggable, MediaAttachment, `KnowledgeSource.sourceId`, `AuditLog.entityId`) aren't DB-enforced — a bug could write an orphaned or mistyped reference. | Medium | Reconciliation jobs (§1.4), low-stakes failure modes (invisible orphan rows, not corrupted data) | Implement the reconciliation jobs in the same phase as the feature they clean up for — don't defer them past Phase 11. |
| Connection exhaustion under serverless + Postgres if pooling isn't configured correctly. | High (until decided) | Explicitly named as a required, not optional, decision (§6.1) | Must be resolved before Phase 5 ships to production — this is the single highest-severity open item. |
| `KnowledgeSource.extractedText` drifting from its live source between publishes. | Low–Medium | Sync is tied to the Publish action, not a separate manual step (§1.4) | None needed now; revisit if content types with partial/incremental edits (vs. full re-publish) are added later. |
| Single-`Owner` assumption could become a real limitation. | Low (not needed today) | Named explicitly (§6.7) rather than silently assumed | Decide only when a second owner is actually needed — correctly deferred, not a current gap. |
| AI/LLM cost growth with usage. | Medium, long-term | `Message.tokensUsed` tracked from day one (§1.6) | Needs a cost dashboard/alerting design once Phase 11 ships — not designed in this document set, flagged for that phase. |
| Rich-text format for Blog left undecided. | Low | Explicitly named, not silently defaulted | Decide during Phase 9 planning, once the Blog editor's UX requirements are clearer — appropriately deferred. |

### 8.3 What should be decided before Phase 5

The seven items in §6, in priority order: **(1) hosting/pooling — blocking**,
**(2) embedding model/dimension — blocking once Phase 11 is scheduled, but
not before Phase 5 itself**, then (3) retention windows, (4) rate-limiting
mechanism, (5) rich-text format, (6) multi-owner posture (confirm "not
needed yet" is still true), (7) analytics consent posture (confirm "no PII"
remains true as features are added). Only item 1 is a true Phase 5 blocker;
the rest are correctly sequenced to their own later phases and listed here
so they're never *forgotten*, not because they're all equally urgent today.
