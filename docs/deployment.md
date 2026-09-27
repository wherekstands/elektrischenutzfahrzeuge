# Deployment

Production: Vercel (region `fra1`) + Supabase (EU / Frankfurt) + Stripe. Two Supabase projects: one for
**production**, one for **development and previews**. The existing project
`azkvlrrquhgjufrotfld.supabase.co` can be either; create the other one in the same region.

## 1. Supabase (do this for both projects)

**Region:** Central EU (Frankfurt), `eu-central-1`.

**Lock down the Data API (important).** Supabase exposes every table in the `public` schema through its
REST/GraphQL Data API. Payload's tables (including `users` with password hashes) live there, and the
site does not use the Data API. In *Project Settings → Data API*, disable the Data API or remove
`public` from the exposed schemas. As a second layer you can enable RLS on all tables without policies
(Payload connects as the table owner and is not affected).

**Database connection** (*Connect* button → connection strings):

| Variable | Value |
|---|---|
| `DATABASE_URL` | *Transaction pooler* URI (port **6543**), for the serverless runtime. Remove any `?sslmode=` parameter. |
| `DATABASE_MIGRATE_URL` | *Session pooler* or direct URI (port **5432**), used by `pnpm migrate`. |
| `DATABASE_CA_CERT` | *Project Settings → Database → SSL Configuration → Download certificate*; paste the PEM with line breaks as `\n`. Verifies TLS. (Fallback: `DATABASE_SSL=no-verify`.) |
| `DATABASE_POOL_MAX` | `5` (serverless functions keep few connections; the pooler multiplexes). |
| `PAYLOAD_DB_PUSH` | `false`. Shared databases change only through migrations. |

**Storage** (photos and PDFs):

1. *Storage → New bucket* `ecv-base`, **public**.
2. *Project Settings → Storage → S3 Connection*: enable, note endpoint and region, create an access key.
3. Set `S3_ENDPOINT` (`https://<ref>.supabase.co/storage/v1/s3`), `S3_REGION` (`eu-central-1`),
   `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and
   `S3_PUBLIC_URL=https://<ref>.supabase.co/storage/v1/object/public/ecv-base`.

**Backups:** daily backups are included on paid plans; enable point-in-time recovery for production.

## 2. First database setup

Do this once per Supabase project, from a machine with the repository, **before** the first Vercel
deployment (the build pre-renders pages from the data it finds):

```bash
# .env pointing at the target project: DATABASE_URL, DATABASE_MIGRATE_URL, PAYLOAD_SECRET,
# DATABASE_SSL=no-verify (or DATABASE_CA_CERT), SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
pnpm migrate        # 1. create the tables
pnpm seed           # 2a. production: taxonomy, specs, reference listings, pages. NEVER seed:demo.
pnpm seed:demo      # 2b. development project only: the same plus fictional demo partners
```

**Or let the Vercel build do it:** set `SEED_ON_BUILD=demo` (development/preview) or `SEED_ON_BUILD=real`
(production) in Vercel. The build command (`pnpm run ci`) then runs migrations, loads the initial data
**only if the database has no listings**, and builds. Demo data is refused on production. You can
remove the variable after the first successful deployment.

Order matters: migrations first, then the seed. Schema "push" only runs against a local database, so
seeding a Supabase project never changes its tables (a push there would make the next migration stop at
an interactive prompt). If you seed after a deployment, redeploy so static pages are rebuilt with data.

Without `SEED_ADMIN_*` the first account created at `/admin` becomes admin. The seed refuses `--fresh`
in production.

## 3. Vercel

1. Import the GitHub repository. `vercel.json` sets the build command (`pnpm run ci` = migrate + build),
   the install command and the region `fra1` (next to the database).
2. Environment variables, per environment:

| Variable | Production | Preview / Development |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://elektrischenutzfahrzeuge.de` | leave empty (canonical falls back to the production domain; previews are noindex anyway) |
| `NEXT_PUBLIC_SITE_NAME` | `ECV Base` | same |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` (Vercel then uses the exact pnpm version from `package.json`) | `1` |
| `SEED_ON_BUILD` | `real` for the first deployment only | `demo` |
| `NEXT_PUBLIC_LOCALES` | `en` (later `en,de`) | same or `en,de` to test German |
| `PAYLOAD_SECRET` | long random string (different per environment) | long random string |
| Database, storage | production Supabase project | development Supabase project |
| `PAYLOAD_DB_PUSH` | `false` | `false` |
| Stripe | live keys and prices | test keys and prices |
| `INDEXNOW_KEY` | 32 hex characters | – |
| `SMTP_*`, `EMAIL_FROM` | for password reset emails | optional |

Indexing is allowed only when `VERCEL_ENV=production`. Preview deployments send `X-Robots-Tag: noindex`
and a blocking robots.txt automatically.

3. **Firewall / bot protection:** if you enable Vercel's bot protection or a CDN "block AI crawlers"
   setting, allow the crawlers listed in robots.txt (search and AI answer engines). Blocking them
   defeats the GEO strategy.
4. **Domains:** add `elektrischenutzfahrzeuge.de` and `www.elektrischenutzfahrzeuge.de`; make the apex the
   primary domain and redirect `www` to it (308). Set DNS as Vercel shows (A record for the apex,
   CNAME for `www`).
5. Preview deployments of branches run migrations against the development database. Keep migrations
   linear (merge `main` before creating a new one).

### Moving to ecvbase.com later

Add the new domain, set it as primary, redirect the old domain permanently (path-preserving), change
`NEXT_PUBLIC_SITE_URL`, redeploy, then use Google Search Console's *Change of address* and Bing's *Site
move* tool. Keep the old domain registered and redirecting.

## 4. Stripe

1. *Products*: "ECV Base Starter" and "ECV Base Pro", each with a **recurring yearly price per unit** in EUR
   (unit = listed model; e.g. €20 per model per year, pricing to be confirmed). Put the price IDs into
   `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO`. Keep the prices shown on `/for-manufacturers` (Pricing
   global in the admin) in line.
2. *Customer portal* (Settings → Billing → Customer portal): allow invoices, payment method updates,
   cancellation, and switching between the Starter and Pro prices.
3. *Webhook* (Developers → Webhooks): endpoint `https://<domain>/api/stripe/webhook`, events
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`.
   Signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Tax: Checkout collects the billing address and VAT ID. Enable Stripe Tax and set
   `STRIPE_AUTOMATIC_TAX=true` if you want Stripe to calculate VAT; otherwise handle it in your prices.
5. Test in test mode with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

Invoiced partners (outside Stripe): set the brand's subscription status to **manual**, tier and *valid
until* by hand.

## 5. Search engines

- Google Search Console and Bing Webmaster Tools: verify by DNS (or `GOOGLE_SITE_VERIFICATION` /
  `BING_SITE_VERIFICATION`), submit `https://<domain>/sitemap.xml`.
- IndexNow: set `INDEXNOW_KEY`; the key file is served at `/indexnow-key.txt` and publishing a listing
  pings IndexNow automatically.
- Check a vehicle page in the Rich Results Test and the Schema Markup Validator after launch.

## 6. Local development

```bash
cp .env.example .env    # local Postgres, PAYLOAD_SECRET, SEED_ADMIN_*
pnpm install && pnpm seed:demo && pnpm dev
```

Locally the schema is pushed automatically (no migrations needed). After changing collections or fields,
create a migration with `pnpm migrate:create <name>` and commit it; CI fails when the schema and the
migrations disagree.
