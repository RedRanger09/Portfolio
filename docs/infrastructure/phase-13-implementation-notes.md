# Phase 13 Implementation Notes — Real Google Analytics Integration

Replaces mock analytics with Google Analytics 4 (Data API + public site tracking).

## Folder changes

```
src/lib/analytics.ts                          UPDATED — tracking vs reporting config helpers
src/config/env.ts                             UPDATED — GA4 property + service account vars
src/features/analytics/
├─ data.ts                                    UPDATED — real GA4 assembly, no fabrication
├─ index.ts                                   NEW
├─ components/
│  ├─ google-analytics.tsx                    NEW — gtag loader
│  └─ google-analytics-page-views.tsx         NEW — App Router page_view events
└─ lib/
   ├─ ga4-client.ts                           NEW — BetaAnalyticsDataClient
   ├─ ga4-reports.ts                          NEW — runReport wrappers + mapping
   └─ ga4-cache.ts                            NEW — unstable_cache (5 min TTL)
src/features/admin/analytics/components/      UPDATED — live / empty / error states
src/app/(site)/layout.tsx                     UPDATED — inject GA when measurement ID set
next.config.ts                                UPDATED — CSP allow-list for GA/GTM
.env.example                                  UPDATED — full GA4 setup instructions
```

## Analytics architecture

```
Public site
  GoogleAnalytics (gtag.js) + GoogleAnalyticsPageViews (client navigations)
        ↓
  GA4 property (measurement ID G-…)

Admin /admin/analytics
  getAnalyticsDashboardData()
        ↓
  getCachedGa4ReportBundle()  ← unstable_cache, 300s
        ↓
  fetchGa4ReportBundle() → BetaAnalyticsDataClient.runReport
        ↓
  Map pagePath → top pages / projects / blog; channels → acquisition
```

## Google Analytics integration

| Concern | Mechanism |
|---|---|
| Client tracking | `GOOGLE_ANALYTICS_ID` → gtag in `(site)` layout only |
| Server reporting | `@google-analytics/data` with service account credentials |
| Property | `GA4_PROPERTY_ID` → `properties/{id}` |
| Auth | `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` |

## Data flow

1. Dashboard page (Server Component) calls `getAnalyticsDashboardData()`.
2. If reporting env is incomplete → `status: 'not_configured'` empty state (no fake numbers).
3. If configured → cached GA4 reports for last 28 days (overview, top pages, acquisition) and last 7 days (recent path×hour).
4. Project/blog rows are filtered from real `pagePath` values and labeled via Prisma.
5. API errors → `status: 'error'` with message; zero traffic → `status: 'empty'`.

## Caching strategy

`unstable_cache` with `revalidate: 300` (5 minutes) and key `ga4-dashboard-report-bundle`.
Avoids a Data API round-trip on every admin navigation while keeping metrics reasonably fresh.

## Security decisions

- Service account private key is server-only (`env.ts`, never `NEXT_PUBLIC_*`).
- Data API client is `server-only`.
- Measurement ID is passed as a prop from the Server Component layout (not required as a public env var, though it is non-secret).
- CSP updated to allow GTM/GA script, image, and connect endpoints.

## Environment variables required

| Variable | Required for | Notes |
|---|---|---|
| `GOOGLE_ANALYTICS_ID` | Public tracking | `G-XXXXXXXX` |
| `GA4_PROPERTY_ID` | Admin reports | Numeric property ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Admin reports | Service account email |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Admin reports | PEM; `\n` escapes supported |

## Production deployment steps

1. Create GA4 property; copy measurement ID → `GOOGLE_ANALYTICS_ID`.
2. Create GCP service account; enable **Google Analytics Data API**.
3. Create JSON key; set email + private key in Vercel (Production).
4. GA4 Admin → Property access management → add service account as **Viewer**.
5. Copy numeric Property ID → `GA4_PROPERTY_ID`.
6. Redeploy; visit public site to generate traffic; open `/admin/analytics` after GA4 processing (often minutes, sometimes longer for new properties).

## Remaining limitations

- Public `/blog/[slug]` routes are not shipped yet — blog rankings appear only once those paths receive traffic.
- In-memory/`unstable_cache` is per-region/instance; not a shared Redis cache.
- No consent banner / GDPR CMP — add if you need cookie consent before loading gtag.
- Historical custom events beyond page views are not modeled yet.
