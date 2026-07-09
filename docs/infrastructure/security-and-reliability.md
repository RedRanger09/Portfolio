# Security & Reliability

> Companion to [`infrastructure-overview.md`](./infrastructure-overview.md).
> Covers the security control set end-to-end, and disaster recovery for
> every category of failure this platform could experience.

## 1. Security

### 1.1 Authentication

**Clerk** owns identity end-to-end (`system-overview.md §4.3`). Infrastructure-level controls on top of that decision:

- **MFA required for Owner/Admin accounts** — enforced in Clerk's dashboard
  policy, not optional. There are only a handful of admin users
  (`database-design.md §7`); requiring MFA for all of them costs nothing in
  usability and closes off the single highest-value credential-theft
  target on the whole platform.
- **Session duration** kept short for admin sessions relative to public
  sessions (Clerk-configurable) — an admin session is a write-capable
  session; it shouldn't outlive a public browsing session by default.
- **Separate Clerk instances per environment** (`infrastructure-overview.md
  §2`) — a compromised Development/Preview session key can never be
  replayed against Production, because they're different Clerk
  applications entirely, not just different environment variables pointing
  at the same one.

### 1.2 Authorization

RBAC is designed at the schema level in `database-design.md §7`. The
infrastructure enforces it in two independent layers (defense in depth —
either one failing doesn't expose the system):

1. **Coarse gate — middleware.** Every request to the `(admin)` route group
   is checked for a valid Clerk session before it reaches any page or
   Server Action. An unauthenticated request never gets far enough to learn
   anything about the data model.
2. **Fine-grained gate — per-action.** Every Server Action independently
   re-checks the specific permission it requires (`cms-design.md`'s module
   operations table) before touching Prisma. This means a UI bug that
   accidentally renders a "Delete" button for an Editor is not a security
   hole — the action itself still refuses the request server-side.

### 1.3 Secrets

Covered in full in `infrastructure-overview.md §2.1–2.2` (storage,
scoping, rotation cadence). The security framing on top of that: secrets
are treated as **the actual perimeter** of this system, not the network —
there's no VPN or private network to speak of (everything is public
internet + HTTPS + Vercel), so a leaked `DATABASE_URL` or
`CLERK_SECRET_KEY` is equivalent to a full breach. That's why rotation has
a defined cadence rather than being "whenever someone remembers."

### 1.4 Rate limiting

Applied at the two endpoints that are both **public** (unauthenticated) and
**cost- or abuse-sensitive**:

| Endpoint | Why it needs a limit | Mechanism |
|---|---|---|
| Contact form submission (`database-design.md §8`) | Public write path — spam/bot abuse target | IP + fingerprint-based limit via **Upstash Redis + `@upstash/ratelimit`** — a sliding-window limit (e.g. a handful of submissions per IP per hour) rejected with a clear error before it ever reaches Prisma |
| AI chat endpoint (`future-roadmap.md §1`) | Every message costs real money (LLM API billing) — the single largest abuse-to-cost multiplier on the platform | Same mechanism, a stricter limit, applied per session/IP — this is a cost control as much as a security control (`scaling-and-cost.md §2`) |

Every other endpoint sits behind Clerk auth already, which is itself a
(much stronger) rate-limiting proxy — an attacker needs a valid admin
session before rate limiting on those routes would even matter.

### 1.5 Content Security Policy & headers

Configured via `next.config.ts` response headers, applied globally:

- **Content-Security-Policy** — restricts `script-src`/`style-src`/`img-src`/
  `connect-src`/`frame-src` to `'self'` plus the specific known providers
  this platform actually talks to: Cloudinary (media), Clerk (auth UI/iframe
  where applicable), Sentry (error reporting beacon), the LLM provider's
  endpoint (if ever called client-side for streaming — otherwise it's
  server-only and doesn't need a CSP entry at all). Nothing else is
  allow-listed, so a future compromised third-party script has nowhere to
  exfiltrate to.
- **Strict-Transport-Security (HSTS)** — forces HTTPS on every subsequent
  visit, including the first one after a browser has cached the header.
- **X-Content-Type-Options: nosniff** — stops the browser from
  MIME-sniffing a response into something more dangerous than its declared
  type.
- **frame-ancestors 'none'** (CSP) / **X-Frame-Options: DENY** — this site
  is never legitimately framed by another origin; blocking it removes an
  entire class of clickjacking attempts for free.
- **Referrer-Policy: strict-origin-when-cross-origin** — avoids leaking full
  URLs (which could contain content slugs or admin paths) to third-party
  destinations via the `Referer` header.
- **Permissions-Policy** — explicitly denies browser features this site
  never uses (camera, microphone, geolocation, etc.), so an XSS that
  somehow got through everything else still can't request device access.

### 1.6 HTTPS

Enforced automatically by Vercel — TLS certificates are provisioned and
renewed automatically (Let's Encrypt) for the custom domain, and HTTP
requests are redirected to HTTPS by default. Nothing to configure beyond
confirming the custom domain is actually attached in the Vercel dashboard;
this is one of the few controls in this entire document that requires
zero ongoing attention.

### 1.7 File uploads

- **Never proxied through a Vercel function as raw bytes** — uploads go
  browser → Cloudinary directly, using a short-lived signed upload request
  (`database-and-storage.md §2.1`). This removes an entire class of risk
  (arbitrarily large or malicious payloads hitting application server
  code) by construction, not by validation.
- **Type and size restrictions enforced by the Cloudinary upload preset
  itself** (`database-and-storage.md §2.5`) — server-side at Cloudinary,
  not just a client-side `accept` attribute, which any attacker can
  trivially bypass by crafting the request directly.
- **Upload capability is gated behind Clerk auth** — only Admin/Editor
  roles can reach the flow at all, which is why malware/content moderation
  scanning isn't a launch requirement (no anonymous upload surface exists —
  `database-and-storage.md §2.5`).

### 1.8 Input validation

**Zod schemas at every Server Action and Route Handler boundary** — the
contact form, every admin mutation, and the AI chat input all validate
their payload shape *before* it touches Prisma or an external API call.
This is also the natural evolution point already flagged in
`ARCHITECTURE.md` for `env.ts` moving to Zod-validated environment
variables — the same validation discipline applied to both request input
and configuration input.

Additional, more specific controls:

- **SQL injection** is a non-issue by construction — Prisma's query builder
  parameterizes every query; there is no raw string concatenation into SQL
  anywhere in this architecture's design.
- **XSS** is mitigated by React's default output escaping plus the CSP
  above, **except** for one deliberate risk surface: rendering
  user-authored rich content (the Blog's MDX/rich-text body —
  `domain-model.md`'s `Post` entity). That content is authored only by
  trusted Admin/Editor roles, but it must still be sanitized on render
  (e.g. `rehype-sanitize` in the MDX pipeline) as a defense-in-depth
  measure against a compromised admin session or a future contributor role
  with lower trust.

## 2. Reliability summary

The controls above map directly onto the earlier architecture documents —
nothing here introduces a new entity or schema; it's the operational
enforcement of decisions already made:

| Control | Enforces (from `docs/architecture/`) |
|---|---|
| Middleware + per-action auth checks | `database-design.md §7` (RBAC) |
| Rate limiting on contact form + AI chat | `database-design.md §8` (public write path), `future-roadmap.md §1` (AI cost posture) |
| CSP allow-list | `system-overview.md §4` (the exact set of third parties this system talks to) |
| Zod at every mutation boundary | `cms-design.md`'s draft/publish workflow (bad input should never reach a `ContentVersion` snapshot) |

## 3. Disaster recovery

| Scenario | Recovery mechanism | RTO (time to restore) | RPO (data loss window) |
|---|---|---|---|
| **Application bug in production** | Vercel "promote previous deployment" (`deployment-and-operations.md §2`) | Seconds | None — no data involved |
| **Bad but non-destructive migration** | Not a recovery scenario by design — additive migrations mean the previous app version keeps working (`deployment-and-operations.md §1.1`) | N/A | N/A |
| **Destructive migration applied by mistake** | Neon point-in-time restore to a new branch, verify, repoint Production | Minutes–1 hour (deliberately manual/reviewed, not automated) | Near-zero with Neon's continuous WAL-based PITR (paid tier); up to 24h if relying on the free tier's daily backup only |
| **Database provider incident** (Neon outage) | Wait it out (Vercel app itself stays up, but writes/reads fail) — no automated multi-provider failover is designed, since that complexity isn't justified at this platform's scale (`scaling-and-cost.md §1`) | Bounded by Neon's own incident response | None (no data loss, just unavailability) |
| **Cloudinary asset unexpectedly missing** | Reconciliation script (`database-and-storage.md §2.6`) flags drift; restore from the secondary metadata/asset export | Hours (manual re-upload if the secondary export doesn't have the specific file) | Bounded by export cadence |
| **Compromised secret** | Rotation runbook, run immediately (`infrastructure-overview.md §2.2`) | Minutes | None (rotation doesn't lose data — it just changes credentials) |
| **Lost access to a control-plane account** (Vercel/GitHub/Neon/Clerk/Cloudinary) | Provider's own account-recovery flow, using 2FA backup codes stored in the password manager (`infrastructure-overview.md §3`) | Minutes–hours, dependent on the provider's own recovery process | None |
| **Total loss of the developer's own credentials/device** (the "hit by a bus" scenario, named explicitly since this is a solo-owner platform) | The password manager's **emergency-access/beneficiary feature** (e.g. 1Password's Emergency Kit) is the only mechanism that makes this recoverable at all — documented here as a requirement, not solved by any code in this repository | N/A — this is a personal operational practice, not infrastructure | N/A |

### 3.1 RTO/RPO targets, stated plainly

- **RTO for the application itself: seconds.** This is Vercel's rollback
  model doing the work, and it's true regardless of platform maturity.
- **RTO for a full database restore: well under an hour.** Acceptable
  because it's an intentionally rare, high-severity scenario — optimizing
  it further (e.g. automated failover) isn't worth the added complexity at
  this platform's scale.
- **RPO target: near-zero once Neon's paid PITR tier is active**
  (continuous WAL-based recovery); **up to 24 hours** if still on the free
  tier's backup cadence. This is an explicit, named tradeoff — staying on
  the free tier trades a wider data-loss window for zero cost, which is the
  right tradeoff during the "Student" cost phase (`scaling-and-cost.md
  §2`) and the wrong one once real editorial content (blog posts,
  portfolio updates) accumulates enough value to justify the upgrade.

### 3.2 Account recovery — the honest dependency

This platform has exactly one owner. Every recovery path above eventually
reduces to: *can Akshay get back into Vercel, GitHub, Neon, Clerk, and
Cloudinary?* That is not a weakness unique to this design — it's the
correct and honest statement of a solo-owner platform's actual trust
model. The only infrastructure response to it is making sure that single
point of recovery (2FA backup codes + a password manager with
emergency-access support) is itself durable, which is why it's named
explicitly here rather than left implicit.
