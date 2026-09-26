<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ECV Base: project notes

Directory of electric commercial vehicles (Next.js 16 + Payload 3 in one app, Postgres, next-intl).
Read `README.md` and `docs/architecture.md` first.

## Rules that are easy to break

- **Payment never changes data.** Paid tiers unlock contact, badge, documents, benefits and *labelled*
  visibility only. Explicit sorts and filters must stay payment-free; every boosted position is labelled.
  Keep `src/lib/catalog/rank.ts` and the "How ranking works" page in sync.
- **Never pass `locale` together with `req`** to the Payload Local API inside hooks: Payload then switches
  the request's locale and a German save is written into English fields. Use `src/hooks/withLocale.ts`.
- **No `dynamicParams = false`** on routes that read the catalogue: pages 404 after `revalidateTag`.
- **Partners write drafts only** (`src/hooks/partnerGuard.ts`); staff-only fields use field access.
- **Schema changes need a migration**: `pnpm migrate:create <name>`; CI fails on drift.
- Public pages read the catalogue snapshot (`getCatalog`), never the REST API. Business rules live in the
  pure `Catalog` class and `src/lib/catalog/*.ts`; add unit tests there (`tests/fixtures/catalog.ts`).
- All numbers, prices and dates go through `src/lib/catalog/format.ts` (Intl). UI strings go into every
  `messages/*.json` (a unit test checks keys and placeholders).
- Titles ≤ 60, descriptions ≤ 155 characters (`src/lib/seo/metadata.ts`). No review/rating markup.
- Demo data (`pnpm seed:demo`) is fictional and must never reach production.

## Checks before pushing

`pnpm lint && pnpm typecheck && pnpm test:unit`; with a database also `pnpm test:int`; for routing,
caching or SEO changes also `pnpm build` and `pnpm test:e2e` against `pnpm start`.
