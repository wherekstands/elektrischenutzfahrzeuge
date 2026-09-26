# SEO and LLM visibility (GEO): implementation notes

Organic search and AI answer engines are the main growth channel. This maps the SEO/GEO specification
("03 SEO and LLM visibility") to the code, and lists deliberate deviations and open items.

## 1. URL plan

| URL | Route | Indexing |
|---|---|---|
| `/` → 308 → `/en` | next.config.ts | – |
| `/en` | `[locale]/page.tsx` | index |
| `/en/vehicles` | `[locale]/vehicles` | index |
| `/en/vehicles/{slug}` | `[locale]/vehicles/[slug]` | index |
| `/en/vehicles/{slug}.md` | `src/app/md/…` via proxy | Markdown twin, `Link: rel=canonical` header to the HTML page |
| `/en/types`, `/en/types/{group}[/{type}]` | `[locale]/types/[...slug]` | index when ≥ 3 listings |
| `/en/types/{type}/for/{job}` | same route, curated landing pages only | index when ≥ 3 listings |
| `/en/jobs`, `/en/jobs/{area}[/{job}]` | `[locale]/jobs/[...slug]` | index when ≥ 3 listings |
| `/en/brands`, `/en/brands/{brand}` | `[locale]/brands` | index |
| `/en/guides`, `/en/guides/{slug}` | `[locale]/guides` | index |
| `/en/about`, `/methodology`, `/how-ranking-works`, `/for-manufacturers`, `/legal/*` | trust and legal pages | index |
| `/en/data` | open dataset (only when enabled in Settings) | index |
| `/en/compare`, `/en/saved` | client lists rendered from `?ids=` | noindex (`/saved` also disallowed in robots) |
| Any hub + filter/sort parameters | rewritten to `[locale]/filtered/…` | noindex, follow; canonical → clean hub |

- Locale prefix always; no Accept-Language redirects or locale cookies.
- German pathnames are prepared (`/de/fahrzeuge`, `/de/typen/…/fuer/…`, `/de/einsatz`, `/de/marken`, …)
  in `src/i18n/routing.ts`.
- A single `type` or `job` facet on `/vehicles` redirects (308) to its hub.
- Slugs: lowercase ASCII, umlauts transliterated, `for`/`fuer` reserved. Slug changes write redirects
  (listings, brands, guides automatically; types/jobs by hand), honoured by the page routes.
- Not built yet: `/en/compare/{a}-vs-{b}` (Phase 3). Add when there is search demand for specific pairs.

## 2. Rendering

Everything is server-rendered HTML with semantic structure (one `h1`, `main`, `nav`, `article`, tables
with `th scope`, definition lists for figures). Hubs and vehicle pages are static and regenerate on
publish; faceted pages are rendered on request. Client JavaScript only adds saving, comparing, the
filter drawer and search suggestions; all links in menus and facets are in the HTML.

## 3. Metadata

`src/lib/seo/metadata.ts` (`buildMetadata`):

- Title ≤ 60 characters: vehicle pages "{Brand} {Model}: range, battery, payload & price | ECV Base"
  (parts taken from the type's key figures that have values; the longest variant that fits wins).
- Description ≤ 155 characters, built from real values ("416 km range, 71.2 kWh battery, …").
- Canonical, `hreflang` for every locale where the page exists plus `x-default`, Open Graph and Twitter
  cards, `max-image-preview:large`.
- Generated share images (`/og/{locale}/vehicles|types|brands/…`, 1200×630) with name and key figures.
- Preview deployments send `X-Robots-Tag: noindex` for the whole site and robots.txt disallows all.
  Production is detected via `VERCEL_ENV=production` (or `SITE_ENV=production` / `ALLOW_INDEXING=true`).

## 4. Structured data (schema-dts, `src/lib/seo/jsonld.ts`)

| Page | Types |
|---|---|
| Home | `WebSite` + `SearchAction`, `Organization` |
| Vehicle | `Product` (+ `Vehicle` for road vehicles, N1–N3, M2–M3, L) with `brand`, `manufacturer`, `category`, `additionalProperty` (`PropertyValue` with `unitCode` for every published spec), `image`; `Offer` only when a net list price is published; `ItemPage` with `dateModified` and, for confirmed data, `reviewedBy` + `lastReviewed` |
| Hubs, brand pages | `CollectionPage` + `ItemList`, `BreadcrumbList`, `FAQPage` when FAQs exist |
| Guides | `Article` with author and dates |
| About | `AboutPage`, `Organization` |

**Deviation:** without a published price the vehicle uses `ProductModel` (a schema.org Product subtype for
"a vendor specification of a product") instead of `Product`. Google's product snippet requires offers,
reviews or ratings; plain `Product` without them shows as an error in Search Console, and we never invent
prices or reviews. Switch with `PRODUCT_TYPE_WITHOUT_PRICE` if the Rich Results Test says otherwise.

No reviews or ratings are marked up anywhere (tests fail if they appear). Unit tests validate the JSON-LD
builders; the e2e suite parses the JSON-LD of every page type.

## 5. Crawlers

- `robots.txt` (`src/app/robots.ts`) allows everyone and names AI search and training crawlers explicitly:
  OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Bingbot,
  Googlebot, Applebot, DuckAssistBot, GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot,
  meta-externalagent. Allowing training crawlers is a business decision; change `AI_TRAINING_BOTS` to opt
  out. Also make sure no firewall or CDN "block AI bots" setting overrides this (see deployment.md).
- Sitemap index `/sitemap.xml` → `/sitemaps/{pages,vehicles,types,jobs,brands,guides}.xml` with `lastmod`
  and `xhtml:link` hreflang alternates. Only indexable URLs are listed.
- IndexNow: publishing a listing pings IndexNow in production (`INDEXNOW_KEY`, key file at
  `/indexnow-key.txt`).

## 6. Content for LLMs

- `/llms.txt` (overview, sections, key pages) and `/llms-full.txt` (all listings in one file).
- Markdown twin of every vehicle page (`.md`), linked with `<link rel="alternate" type="text/markdown">`.
- **Citable fact sentences** on every vehicle page, generated from data (`src/lib/catalog/sentences.ts`):
  "The Kia PV5 Cargo Long Range (small van) has a range of up to 416 km, a 71.2 kWh usable battery, …".
- Units always written out, sources linked, "last updated" and "confirmed by" dates on every page.
- Open dataset (`/en/data`, JSON and CSV) behind the *Open data* switch in Settings, with licence note.

## 7. Trust and paid visibility

- Trust pages: About (who runs it), Methodology (sources, estimates, corrections), How ranking works
  (linked next to every sort control), For manufacturers (tiers, prices), Imprint, Privacy.
- Paid positions are labelled "Sponsored", featured slots "Featured partner"; the spotlight's outbound
  link is `rel="sponsored"`. The "Data confirmed by …" badge states what it means and is not a quality
  seal. Payment never changes spec values, explicit sorts or filters (EU/German unfair commercial
  practices and P2B transparency).

## 8. Hubs, guides, internal links

- Each hub: intro (80–200 words, editable), key-figure ranges, comparison table of all models, 3–5 FAQs,
  related types/jobs and guides, curated type × job pages. Hubs with fewer than three listings are
  `noindex` but stay reachable.
- Vehicle pages link to their type, group, jobs, brand, other versions and similar vehicles
  (data-based). Guides link to hubs and vehicles.

## 9. Multilingual

A locale is published per page only when its own content exists; `hreflang` lists only existing
versions. Numbers, units, prices and dates are formatted per locale with `Intl`. UI strings for German
are complete (`messages/de.json`); switch on with `NEXT_PUBLIC_LOCALES=en,de` once content is translated.

## 10. Measurement

Vercel Web Analytics and Speed Insights (cookie-less, no consent banner needed for them). Custom events:
"Email contact" and "Manufacturer page" with brand and listing. Add Google Search Console and Bing
Webmaster Tools (verification via DNS or `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`) and
submit `/sitemap.xml`.
