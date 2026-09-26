# ECV Base

The directory of electric commercial vehicles and machines for Europe: vans, trucks, buses, municipal,
construction, agricultural and industrial machines. Buyers find and compare models by vehicle type or by
job and email the manufacturer directly; manufacturers pay for a named contact, confirmed data and
labelled visibility; researchers and AI assistants get citable, consistently structured data.

Published at first under **elektrischenutzfahrzeuge.de**, later **ecvbase.com**. English at launch, German
prepared.

## Stack

| | |
|---|---|
| App | Next.js 16 (App Router, React Server Components) with Payload CMS 3 in the same app (`/admin`) |
| Data | Postgres (Supabase, EU/Frankfurt; separate prod and dev projects), files in Supabase Storage (S3 API) |
| Hosting | Vercel (region `fra1`), own domain |
| i18n | next-intl (routing, UI strings) + Payload localization (content) |
| Payments | Stripe subscriptions per brand, priced per listed model per year |
| Tests | Vitest (unit, integration against Postgres), Playwright (end-to-end) |

## Quick start

Requirements: Node 22.12+, pnpm 10, a local Postgres 15+.

```bash
cp .env.example .env            # set DATABASE_URL, PAYLOAD_SECRET, SEED_ADMIN_EMAIL/PASSWORD
pnpm install
pnpm seed:demo                  # taxonomy, specs, 68 real listings, pages + fictional demo partners
pnpm dev                        # http://localhost:3000/en and http://localhost:3000/admin
```

`pnpm seed` loads the same data without the fictional demo partners, placements and benefits. Never run
`seed:demo` against production. Locally the schema syncs automatically; shared databases use migrations.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / server |
| `pnpm ci` | `migrate` + `build` (Vercel build command) |
| `pnpm migrate` | Apply database migrations (`src/migrations`) |
| `pnpm migrate:create <name>` | Create a migration after changing collections or fields |
| `pnpm generate:types` / `generate:importmap` | Regenerate Payload types / admin import map |
| `pnpm seed` / `seed:demo` | Load base data / base data plus demo partners (`--fresh` wipes first, never in production) |
| `pnpm lint` / `typecheck` | ESLint / TypeScript |
| `pnpm test:unit` | Unit tests (no database) |
| `pnpm test:int` | Integration tests against `DATABASE_URL` (creates and removes its own records) |
| `pnpm test:e2e` | Playwright against a running, seeded site (`E2E_BASE_URL` to target another deployment) |

## Where things are

```
src/app/(frontend)/[locale]/   public site (hubs, vehicle pages, compare, saved, guides, trust pages)
src/app/(payload)/              Payload admin and REST API
src/app/{sitemap.xml,sitemaps,robots.ts,llms.txt,md,og,data}/   crawler files, Markdown twins, OG images, open data
src/collections, src/globals    CMS data model (taxonomy, specs, listings, brands, placements, …)
src/lib/catalog/                read model: loading, caching, filters, ranking, formatting, fact sentences
src/lib/seo/                    metadata, JSON-LD, sitemaps, Markdown twins, OG images
src/components/                 UI (server components by default; client components in components/client)
src/endpoints/billing.ts        Stripe checkout, portal, sync and webhook
src/proxy.ts                    request pipeline (locale routing, faceted URLs, Markdown twins)
messages/                       UI strings per locale
scripts/seed/                   taxonomy, specs, hub texts, guides and the reference listings
tests/                          unit, integration and end-to-end tests
```

## Documentation

- [Architecture](docs/architecture.md): data flow, caching, rendering, routing, i18n
- [Taxonomy](docs/taxonomy.md): vehicle types, jobs, spec profiles and how to extend them
- [Editing handbook](docs/editing.md): listings, photos, corrections, partner drafts, placements, translations
- [SEO and GEO](docs/seo-geo.md): how the SEO/LLM-visibility spec is implemented, and deviations
- [Deployment](docs/deployment.md): Supabase, Vercel, Stripe, domain, search consoles
- [Launch checklist](docs/launch-checklist.md)

## Principles

- Every model is listed free. Payment unlocks contact details, the "Data confirmed by …" badge, documents,
  key benefits and **labelled** visibility. It never changes spec values, explicit sorting or filters
  (see `/en/how-ranking-works`).
- Specs come from sources; empty is better than guessed. Corrections are welcome on every listing.
- One page structure for every vehicle; the vehicle type decides which spec rows and key figures appear.
