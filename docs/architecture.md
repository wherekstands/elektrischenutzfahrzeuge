# Architecture

One Next.js 16 app contains the public site and Payload CMS 3 (`/admin`, REST API under `/api`). Payload
talks to Postgres (Supabase) and stores uploads in Supabase Storage through the S3 API. The public site
never uses the REST API: server components read through Payload's Local API.

```
Editors / partners ──► /admin (Payload) ──► Postgres + Storage
                                │ afterChange hooks: revalidateTag('catalog'), redirects, IndexNow,
                                │ review queue for partner drafts
Visitors / crawlers ──► proxy.ts ──► static pages (SSG + on-demand revalidation)
                                 └─► /[locale]/filtered/… (dynamic, noindex) for faceted URLs
```

## Data model

| Collection | Purpose |
|---|---|
| `vehicle-types` | Two levels: groups (Vans, Trucks, …) and types (Small vans, Street sweepers, …). A type can be cross-listed in a second group. Decides spec profile and key figures. See [taxonomy.md](taxonomy.md). |
| `jobs` | Two levels: areas (Municipal & public services) and jobs (Street cleaning). Many-to-many with listings. |
| `specs` | Spec definitions: key, URL key, label, unit, data type, options, "better" direction, filterable, quick filter, group. |
| `listings` | One per model version. `specs` is a JSON object keyed by spec key, validated against `specs` on save. Drafts and versions enabled. |
| `brands` | Profile, named contact, partnership (tier, validity, Stripe ids). Drafts enabled. |
| `media`, `documents` | Photos (WebP, fixed 4:3 crops plus a 1200×630 share crop) and PDFs. |
| `placements` | Paid featured slots and brand spotlights (where and when). |
| `landing-pages` | Curated type × job pages (`/types/trucks/for/waste-collection`). |
| `guides`, `pages` | Editorial content; `pages` holds trust and legal pages by key. |
| `change-requests` | Review inbox: public corrections, partner drafts, listing claims. |
| `redirects` | Old path → new path, written automatically when a slug changes. |
| Globals `settings`, `pricing` | Site-wide texts, contacts, organization data, open-data switch; partner tiers. |

Roles (`users.role`): **admin** (everything incl. users and billing), **editor** (content, publishing),
**partner** (own brand only, drafts only). Access rules live in `src/access`; the "drafts only" rule is a
`beforeOperation` hook (`src/hooks/partnerGuard.ts`) because access functions cannot see the `draft` flag.
Partner drafts open one change request for review (`src/hooks/partnerReview.ts`).

## Read model and caching

`src/lib/catalog/load.ts` loads everything the public site needs for one locale in a handful of queries
and builds a `Catalog` (`src/lib/catalog/catalog.ts`): indexes plus the business rules (what a partnership
unlocks, when a verification is valid, which listings a hub covers, featured slots). At 1,000–1,500
listings this snapshot is a few MB and makes every page a pure function of it.

`getCatalog(locale)` (`src/lib/catalog/index.ts`):

- The Next.js data cache holds only a tiny **version stamp** tagged `catalog` (entries are limited to 2 MB).
- Each server instance keeps the catalogue in memory and reloads it when the stamp changes.
- Publishing anything calls `revalidateTag('catalog', { expire: 0 })`; the stamp also rolls hourly so
  expiring partnerships, placements and "confirmed" badges switch off on time.
- Draft mode (preview) loads drafts uncached.

Pages are statically generated (`generateStaticParams`) and regenerated on demand after a publish. New
listings render on first request. Do not add `dynamicParams = false` to routes that read the catalogue:
Next.js then cannot regenerate them after a hard revalidation and returns 404 (covered by the e2e test
`tests/e2e/publish.spec.ts`).

## Request pipeline (`src/proxy.ts`)

1. `/en/vehicles/<slug>.md` is rewritten to the Markdown twin route (`src/app/md/…`).
2. next-intl adds locale handling and localized pathnames (`/de/fahrzeuge/…`). No Accept-Language
   redirects; `/` redirects permanently to `/en` (next.config.ts).
3. Hub URLs **with** filter or sort parameters are rewritten to `/[locale]/filtered/…`, a dynamic route
   that renders the same view with `noindex, follow` and a canonical to the clean hub. Without parameters
   the static page is served. Tracking parameters (`utm_*`, `gclid`, …) are ignored.

Filter URLs are stable and readable (`?type=small-vans&range_min=300&ports=ccs2&sort=range-desc`). A
single type or job facet on `/vehicles` redirects to its hub. Filtering, facet counts, quick filters and
sorting are pure functions in `src/lib/catalog/filters.ts` and `rank.ts`.

## Ranking and paid visibility

`rank.ts` documents the "Recommended" order: paid boost (Pro 2, Starter 1) → search relevance →
availability → data completeness → type order → name. Every boosted position is labelled "Sponsored";
featured cards are labelled "Featured partner". All explicit sorts and filters ignore payment.
`/en/how-ranking-works` explains this to visitors; keep both in sync.

## Vehicle pages

Every vehicle page has the same structure regardless of type: gallery (fixed 4:3 frames; drawn
illustrations when there are no photos), summary panel with four key figures, key facts (ours) and key
benefits (Pro partners only), a spec sheet grouped in a fixed order with only the rows of the type's spec
profile, charging estimates, documents, contact, sources, similar vehicles. Values that are not published
show as "Not published" with a link to suggest a correction.

Contact is a plain `mailto:` link with the subject `[ECV Base] <Brand> <Model>`. We do not collect or
route leads. Clicks on "Email contact" and "Manufacturer page" are counted with Vercel Analytics
(cookie-less custom events).

## Client state

Saved and compare lists live in `localStorage` (`src/components/client/store.ts`, `useSyncExternalStore`).
The compare and saved pages render from the URL (`?ids=a,b,c`), so both are shareable and server-rendered.

## Corrections

`/vehicles/<slug>/suggest-correction` posts to a server action that stores a change request. Spam
protection: honeypot field, minimum fill time, hourly limit per anonymous fingerprint (hashed IP + user
agent + day; the raw IP is not stored).

## Internationalization

- UI strings: `messages/<locale>.json` (unit test checks keys, placeholders and ICU syntax).
- Content: Payload localization (`en`, `de`). The public site reads each locale **without fallback** and
  publishes a page in a locale only when its own text exists (types/jobs need a name and slug, listings a
  summary). Some fields (key facts, document titles) fall back to English.
- `NEXT_PUBLIC_LOCALES=en,de` switches German on; localized pathnames are in `src/i18n/routing.ts`.
- Numbers, prices and dates always go through `Intl` (`src/lib/catalog/format.ts`).
- Payload hook rule: never pass `locale` together with `req` to the Local API; it switches the whole
  request's locale. Use `withLocale()` (`src/hooks/withLocale.ts`).

## Billing

`src/endpoints/billing.ts`: Stripe Checkout (subscription, quantity = published models), billing portal,
staff "sync quantity", and the webhook. The webhook verifies the signature, re-reads the current
subscription from Stripe (events can arrive out of order) and updates the brand's partnership. Paid
features need an active or trialing subscription (or `past_due` during Stripe's retries) and a
`validUntil` in the future; `manual` covers invoiced partners. Rules: `src/lib/catalog/partnership.ts`.

## Testing

| Suite | Scope |
|---|---|
| `tests/unit` | Catalogue rules, filters, ranking, formatting, spec normalisation, slugs, metadata limits, JSON-LD, fact sentences, billing rules, message files |
| `tests/int` | Partner portal rules, localized editing, Stripe → brand sync (real Postgres, own records) |
| `tests/e2e` | Redirects, canonical/hreflang, faceted noindex, JSON-LD on every page type, Markdown twin, crawler files, compare/saved, publish → page refresh |

CI (`.github/workflows/ci.yml`) runs lint, types and unit tests, then applies migrations to an empty
Postgres, checks that the schema matches the migrations, runs integration tests, seeds, builds and runs
the end-to-end tests against the production build.
