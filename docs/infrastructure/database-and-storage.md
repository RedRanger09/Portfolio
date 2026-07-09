# Database Hosting & Storage

> Companion to [`infrastructure-overview.md`](./infrastructure-overview.md).
> Implements the storage half of the production architecture diagram:
> where PostgreSQL lives, and how media (Cloudinary) is uploaded, cached,
> versioned, and deleted.

## 1. Database hosting

### 1.1 Comparison

| | **Supabase** | **Neon** | **Railway** | **Self-hosted Postgres** |
|---|---|---|---|---|
| **Core model** | Postgres + a bundled platform (auth, storage, realtime, edge functions) | Postgres-only, serverless, storage/compute separated | General-purpose deploy platform with a Postgres add-on | A VM/VPS you provision and patch yourself |
| **Database branching** | Supported, less mature — branches are full compute+storage copies, coarser-grained | **Native, instant, copy-on-write branches** — a branch is created in seconds, costs ~nothing until it diverges from its parent | Not a first-class concept — a "branch" means manually provisioning a second Postgres instance | Fully manual |
| **Connection pooling** | Built-in (Supavisor) | **Built-in (PgBouncer-compatible pooler, on by the connection string you're given)** | Not built-in — must add a separate pooler | Fully manual (install/configure PgBouncer yourself) |
| **Scale-to-zero (cost when idle)** | No (compute runs continuously on paid tiers) | **Yes — compute suspends when idle, resumes on the next query in ~hundreds of ms** | No | No (you pay for the VM whether it's used or not) |
| **pgvector support** | Yes, well-documented, widely used for this | Yes | Yes (it's just Postgres — extension must be enabled) | Yes (manual extension install) |
| **Point-in-time recovery** | Paid tiers | Paid tiers (continuous, WAL-based) | Limited — mostly relies on manual backups | Fully manual (you build this yourself) |
| **Ops burden** | Low | **Very low** | Low | **High** — patching, HA, backups, monitoring, security updates, all manual |
| **Vendor lock-in risk** | Medium (using it for auth/storage too would deepen this — this platform deliberately doesn't) | Low (it's plain Postgres; `pg_dump` works like any Postgres) | Low | None (but see ops burden) |
| **Free tier fit for this project** | Generous, but includes features (auth/storage) this platform doesn't use via Supabase | **Generous, and every feature offered is one this platform actually needs** | Generous for compute, Postgres add-on less generous | "Free" only if you already have a VPS — otherwise, not applicable |

### 1.2 Recommendation: **Neon**

**Why, specifically for this platform:**

1. **Branch-per-Preview-Deployment is the single biggest win.** The
   deployment strategy in `deployment-and-operations.md §1` gives every pull
   request its own Vercel Preview URL — Neon's branching means it can also
   get its **own isolated database branch**, created from `main` in
   seconds, with realistic data, torn down automatically when the PR
   closes. This is the infrastructure half of a promise the CMS design
   makes possible: a reviewer can test an admin content change against a
   real (branched) database without any risk to production data. Supabase
   and Railway can approximate this manually; Neon does it as a native,
   near-zero-cost primitive.
2. **Built-in pooling resolves the single highest-severity open risk**
   flagged in `docs/architecture/database-design.md §11` and
   `future-roadmap.md §8.2`: serverless functions (Vercel) opening many
   short-lived connections against Postgres. Neon's connection string is
   pool-aware by default — nothing extra to run or manage.
3. **Scale-to-zero matches this platform's actual traffic shape.** A
   personal portfolio has long idle stretches between visits; paying for
   always-on compute (Supabase's default, or a VPS) is paying for idle time.
   Neon's autosuspend means Development and Preview branches cost
   effectively nothing when nobody's actively working.
4. **No unused platform surface.** Supabase's auth and storage are
   deliberately not used (Clerk and Cloudinary already own those jobs —
   `system-overview.md §4.3, §4.4`) — adopting Supabase would mean paying
   for and reasoning about capabilities this architecture explicitly
   assigned elsewhere. Neon is Postgres and nothing else, which matches the
   "one job per service" discipline the rest of this document set follows.
5. **Self-hosted is rejected outright** for this platform's ownership
   model: it trades a monthly bill for an ongoing operational burden
   (patching, backup verification, HA) that isn't a good use of a
   solo-developer's time on a project meant to run unattended for years.

## 2. Storage (Cloudinary)

### 2.1 Upload flow

Uploads never pass through a Vercel serverless function as raw file bytes —
that risks hitting function payload/duration limits and adds unnecessary
server load for what's fundamentally a client-to-Cloudinary transfer:

```
Admin picks a file in the Media Library
        │
        ▼
Server Action: getUploadSignature()
   (signs an upload request — scoped to a folder/preset,
    time-limited — using CLOUDINARY_API_SECRET, never exposed to the browser)
        │
        ▼
Browser uploads the file DIRECTLY to Cloudinary
   using the signed signature (Vercel is not in this data path at all)
        │
        ▼
Cloudinary returns the uploaded asset's metadata (public_id, url, dimensions)
        │
        ▼
Server Action: createMedia(metadata)
   writes the Media row (database-design.md §5) — this is the only
   moment the database and Cloudinary become aware of each other
```

### 2.2 Folder structure & environment isolation

```
cloudinary://
├─ prod/
│  ├─ projects/
│  ├─ certificates/
│  ├─ blog/
│  ├─ resume/
│  └─ avatars/
├─ preview/       (mirrors the same subfolders — used by Preview deployments)
└─ dev/           (mirrors the same subfolders — used by local development)
```

One Cloudinary account, environment-prefixed folders (not three separate
Cloudinary accounts) — simpler billing and quota management, while still
guaranteeing a Preview deployment's test upload can never appear as real
content in Production (`infrastructure-overview.md §2` environment table).
Upload presets are configured per environment prefix with matching
restrictions (see §2.5).

### 2.3 Media lifecycle & deletion (two-phase, mirrors the DB's soft-delete philosophy)

```
Admin deletes a Media item
        │
        ▼
Media.deletedAt is set (soft delete — database-design.md §4)
   — immediately disappears from the Media Library UI and any
     "where is this used?" reverse lookups (cms-design.md §4)
   — the Cloudinary asset itself is UNTOUCHED at this point
        │
        │  (retention window — proposed 30 days, shorter than the
        │   90-day DB content retention in database-design.md §4,
        │   since media is typically easier to re-upload than to
        │   reconstruct lost editorial content)
        ▼
Periodic cleanup job (same Vercel Cron mechanism as AI reindexing —
future-roadmap.md §1.4):
   - finds Media rows soft-deleted past the retention window
   - confirms zero references remain (no MediaAttachment row, no
     direct-FK slot still pointing at it — the same reverse-lookup
     query the admin UI uses)
   - only then calls Cloudinary's destroy API and hard-deletes the row
```

The "confirm zero references" check is what prevents a real failure mode:
an admin soft-deleting an image from the library while it's still someone's
`Project.featuredImageId` — the cleanup job simply skips it and it stays
soft-deleted-but-recoverable until the reference is removed.

### 2.4 Versioning

- **Business-level history** (the kind an admin cares about — "what did
  this resume look like 3 versions ago") is handled at the **database**
  layer (`ResumeVersion`, `ContentVersion`) — not by relying on
  Cloudinary's own asset versioning.
- **Cloudinary's built-in versioning** is used only for its narrower,
  original purpose: protecting against accidental overwrite of the same
  `public_id` mid-edit. It is not a substitute for `ResumeVersion` /
  `ContentVersion`, which is why a new resume upload always gets a **new**
  `public_id`/`Media` row rather than overwriting the previous one in place.

### 2.5 File upload security

- Upload presets restrict allowed file types (`image/*`, `application/pdf`
  for resumes, specific video types for future project demos) and a max
  file size — enforced **server-side by Cloudinary**, not just the
  browser's `<input accept>` attribute, which is trivially bypassable.
- Since only authenticated Admin/Editor roles can reach the upload flow at
  all (it's behind the `(admin)` route group), malware/content moderation
  scanning (a Cloudinary add-on) is not required at launch — it becomes a
  relevant control only if a public-upload feature is ever added, which
  isn't planned (`system-overview.md §6`, non-goals).

### 2.6 Backups

Cloudinary's own infrastructure is multi-region-redundant by default, but a
single vendor is still a single point of failure for "can I get my media
back at all" in a true disaster scenario. Two supplementary measures:

- **The `Media` table is the independent index of truth** for "what should
  exist" — a periodic reconciliation script (same pattern as
  `future-roadmap.md §1.4`'s `KnowledgeSource` reconciliation) verifies
  every non-deleted `Media` row still resolves at Cloudinary and alerts on
  drift, rather than discovering a missing asset only when a visitor hits a
  broken image.
- **A periodic export** of Cloudinary asset metadata (and, for the
  highest-value assets specifically — active `ResumeVersion` files and
  `Certificate` images — the files themselves) to a secondary, independent
  location, so recovery doesn't depend on Cloudinary's continued existence
  as a company. Full mechanism (which secondary location, what cadence) is
  a Phase 8 implementation detail; the requirement is named here so it's
  designed for, not forgotten.

### 2.7 CDN

Cloudinary serves every media asset through its own global CDN with
automatic format negotiation (WebP/AVIF where supported) and responsive
breakpoint generation — this **is** the CDN for media; no separate CDN
layer is added in front of it. Vercel's Edge Network is the CDN for
everything else the app serves (HTML, JS, CSS, the app's own static
files) — two CDNs, cleanly divided by content type, matching the
"Cloudinary owns media, Vercel owns the app" boundary already established
in `system-overview.md §4.4`.
