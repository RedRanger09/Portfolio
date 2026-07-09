# Scaling & Cost

> Companion to [`infrastructure-overview.md`](./infrastructure-overview.md).
> Assesses whether this architecture holds at 10, 100, 1,000, and 10,000
> users, then estimates real monthly cost at each phase and names concrete
> levers to reduce it.

## 1. Scaling assessment

"Users" here means distinct visitors/month to the public portfolio, since
that's the platform's actual load driver — the admin side has, at most, a
handful of authenticated users regardless of traffic tier.

| | **10 users** | **100 users** | **1,000 users** | **10,000 users** |
|---|---|---|---|---|
| **Vercel** | Hobby tier, no changes | Hobby tier, still no changes | Pro tier recommended (better function limits, team features) — a plan upgrade, not an architecture change | Pro/Enterprise depending on function invocation volume — still a plan upgrade |
| **Neon** | Free tier, effectively idle | Free tier — connection pooling (already the default connection string) absorbs any burst | Neon autoscales compute automatically within its serverless model; still no manual intervention | Increase the autoscaling compute ceiling in Neon's dashboard — a configuration change, not a redesign |
| **Clerk** | Free tier (<10k MAU) covers this easily | Free tier | Free tier likely still covers it | Approaching or past the free MAU limit — upgrade to a paid Clerk tier |
| **Cloudinary** | Free tier, negligible bandwidth | Free tier | Free tier bandwidth (~25GB/mo) may get tight — first plausible point to upgrade | Paid tier required for bandwidth/storage headroom |
| **ISR / caching** | Irrelevant at this volume | Already absorbing nearly all read load | Doing real work now — most requests never reach the database | Still doing the majority of the work — this is *why* 10,000 users doesn't require a database redesign |
| **AI chat costs** | Negligible | Negligible | First real budget line item if a meaningful fraction of visitors use the assistant | Rate limiting (`security-and-reliability.md §1.4`) becomes essential, not optional, purely for cost containment |
| **Rate limiting (Upstash)** | Not really exercised | Not really exercised | Starting to matter for the AI endpoint specifically | Load-bearing — without it, a viral traffic spike could turn into an uncontrolled LLM bill |
| **Monitoring/alerting** (`deployment-and-operations.md §4`) | Nice to have | Nice to have | Starting to earn its keep — a regression is now plausible to miss without it | Operationally necessary — this is the tier where "someone would have noticed eventually" stops being an acceptable answer |
| **Database connection pooling** | Irrelevant at this volume | Irrelevant | Correctly configured pooling starts to matter | Must be correctly tuned — this is the one place a misconfiguration could actually cause an outage at this tier |
| **Media/CDN** | No change | No change | No change | No change — Cloudinary's CDN and Vercel's Edge Network scale natively to well beyond this tier with zero design changes |

### 1.1 Conclusion

**The architecture holds at all four tiers without a redesign.** Every row
above is a "turn the dial" response (upgrade a plan, raise a limit, tune a
config value) — never a "rebuild this subsystem" response. This is not an
accident: the foundational choices in this document set were selected
specifically because they scale this way —

- **Serverless Postgres with built-in pooling** (Neon) means connection
  exhaustion, the classic serverless-meets-relational-database failure
  mode, was designed out from the start rather than discovered at the
  10,000-user tier.
- **ISR-cached reads** mean the database only ever sees a small,
  roughly-constant slice of total traffic, regardless of how large total
  traffic gets — visitor count and database load are deliberately
  decoupled.
- **CDN-backed media** (Cloudinary + Vercel Edge) means the two heaviest
  categories of bytes served (images, static assets) never touch
  application compute at all, at any tier.
- **Single-writer admin model** means write volume — the traffic
  category that's actually hard to scale — never grows with visitor count
  in the first place; only reads scale with visitors, and reads are
  exactly what caching absorbs.

This directly validates the scalability claims already made in
`docs/architecture/future-roadmap.md`'s final review: the risk at scale on
this platform is **operational complexity**, not raw data volume or
request throughput.

## 2. Cost estimate

### 2.1 Development (local, pre-launch)

| Item | Cost |
|---|---|
| Everything (Vercel, Neon, Clerk, Cloudinary, Resend, Sentry — all free tiers) | **$0/month** |

### 2.2 Student / early-production (realistic for the first 1–2 years, portfolio + CMS live, AI not yet shipped or lightly used)

| Item | Cost | Notes |
|---|---|---|
| Vercel | $0 | Hobby tier covers this comfortably |
| Neon | $0 | Free tier — branching + pooling included |
| Clerk | $0 | Free tier, far under 10k MAU |
| Cloudinary | $0 | Free tier, unlikely to be exceeded at this traffic |
| Resend | $0 | Free tier (3,000 emails/mo) far exceeds contact-form volume |
| Sentry | $0 | Free tier (5k events/mo) |
| Better Uptime | $0 | Free tier sufficient for a single site check |
| Domain name | ~$1/mo | ($10–15/year, amortized) |
| AI provider (OpenAI, once shipped) | $0–20 | Pay-per-use; `gpt-4o-mini` + `text-embedding-3-small` are both inexpensive; $0 until the chatbot ships, low single digits to ~$20/mo at light usage after |
| **Total** | **~$1–25/month** | Effectively free until the AI assistant ships, then still cheap |

### 2.3 Growth production (approaching the 1,000–10,000-user tier, all features live)

| Item | Cost | Notes |
|---|---|---|
| Vercel Pro | $20/mo (per seat) | Needed for headroom on function limits/analytics at this traffic |
| Neon (paid tier) | $20–70/mo | Depends on compute/storage usage; still far cheaper than a comparable managed-HA self-hosted setup |
| Clerk (paid tier) | ~$25/mo+ | Once past the free MAU limit |
| Cloudinary (paid tier) | ~$0–99/mo | Depends on bandwidth/storage; a mid-tier plan is the realistic number if media-heavy blog/project content has grown |
| Sentry (Team plan) | ~$26/mo | More events/retention than the free tier |
| AI provider | $20–100+/mo | Scales directly with chat volume — the least predictable line item, which is exactly why rate limiting exists |
| Resend (paid tier) | ~$20/mo | Only if email volume genuinely grows past free-tier limits |
| Better Uptime / Axiom | $0–~30/mo | Free tiers likely still sufficient; small paid tiers if log retention needs grow |
| **Total** | **roughly $150–350/month** | The wide range reflects that AI and Cloudinary usage are the two genuinely variable costs — everything else is a near-fixed platform fee |

### 2.4 Ways to reduce cost

1. **Cap AI spend with rate limiting, not hope** (`security-and-reliability.md
   §1.4`) — the single biggest lever, since LLM cost is the only line item
   that scales with malicious or accidental abuse rather than legitimate
   usage alone.
2. **Re-embed only on publish, never on view** (`future-roadmap.md §1.4`)
   — already designed in; keeps embedding-generation cost proportional to
   editorial activity, not visitor traffic.
3. **Stay on free tiers until a specific limit is actually hit** — upgrade
   one service at a time, reactively, rather than pre-emptively bundling
   upgrades "just in case." Every row in the growth-tier table is a
   decision to make individually, not a package to buy together.
4. **Right-size and compress media before upload** — Cloudinary's
   auto-format/quality features handle delivery-side optimization
   automatically, but storing unnecessarily large source files still costs
   storage quota for no visual benefit.
5. **Use Neon's scale-to-zero for Development and Preview branches
   specifically** — Production can't scale to zero (it needs to always be
   ready to serve), but every other branch legitimately can, and that's
   where most of the *branch count* (if not traffic) lives.
6. **Prefer Vercel's native domain/DNS and skip a second DNS vendor** — one
   fewer subscription, one fewer integration surface, with no functional
   loss at this platform's scale (`infrastructure-overview.md §4`).
7. **Defer Vercel Pro until a concrete limit is hit** (function invocation
   count, need for team seats, or a specific analytics feature) rather
   than upgrading preemptively at the "growth" label alone — the Hobby
   tier's actual limits, not a round number of users, should be the
   trigger.
