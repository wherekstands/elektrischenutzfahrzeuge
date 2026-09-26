# Launch checklist

## Legal and content

- [ ] **Imprint** (Content → Pages → Imprint): replace the `[TO COMPLETE]` block with the operator's
      details required by § 5 DDG and § 18 MStV (name, address, contact, VAT ID if any, person
      responsible for content). Have it reviewed.
- [ ] **Privacy policy**: check the processors listed (Vercel, Supabase, Stripe, email provider),
      contact details, legal bases and retention of correction submissions. Have it reviewed.
- [ ] **About**: replace the `[TO COMPLETE]` block with the real, named person behind the site.
- [ ] **Partner terms** and **For manufacturers**: confirm tiers, prices per model and year, and what
      each tier includes (Pricing global). Prices on the page must match Stripe.
- [ ] **How ranking works** matches `src/lib/catalog/rank.ts`.
- [ ] Settings global: contact email, partners email, organization name and logo, social profiles.
- [ ] Review the 68 reference listings: sources, availability, prices (net), photos with licences.
- [ ] Hub intros and FAQs for the main types and jobs; at least the curated type × job pages you want
      indexed at launch.

## Data hygiene

- [ ] Production database was seeded with `pnpm seed` (never `seed:demo`). No listing or brand has the
      *Demo* flag; no demo placements, contacts, benefits or confirmation dates exist.
- [ ] Every paid feature shown belongs to a real, active partnership.

## Infrastructure

- [ ] Supabase production project in Frankfurt; **Data API disabled or `public` schema not exposed**;
      backups / point-in-time recovery on; TLS verified with `DATABASE_CA_CERT`.
- [ ] Storage bucket public, S3 keys set, a test upload appears on the site.
- [ ] Vercel production env vars set (see deployment.md), `PAYLOAD_DB_PUSH=false`, migrations ran in the
      build log.
- [ ] Domain: apex primary, `www` redirects, HTTPS valid.
- [ ] Password reset email works (SMTP).
- [ ] Owner account with a strong password; editor accounts created; test partner account can only
      draft its own brand.

## Payments

- [ ] Stripe live products and yearly per-unit prices; price IDs in env.
- [ ] Webhook endpoint with the six subscription events; signing secret set; a test event returns 200.
- [ ] Customer portal configured (invoices, payment method, plan switch, cancel).
- [ ] VAT handling decided (Stripe Tax or prices incl. handling).

## SEO / GEO (spec "03", section 10)

- [ ] `https://<domain>/` redirects to `/en`; no Accept-Language redirects.
- [ ] `robots.txt` on production allows all and lists the AI crawlers; sitemap URL correct.
- [ ] No firewall/CDN rule blocks AI crawlers.
- [ ] Preview deployments are `noindex` (check a preview URL's headers).
- [ ] Sitemap index and all section sitemaps load; URLs are absolute on the production domain.
- [ ] Rich Results Test and Schema Markup Validator: a vehicle with price (Product + Offer), one without
      (ProductModel), a hub (CollectionPage, BreadcrumbList, FAQPage), a guide (Article).
- [ ] Titles ≤ 60 and descriptions ≤ 155 characters on a sample of pages (the e2e suite checks hubs and
      vehicles).
- [ ] Share previews (OG images) look right on LinkedIn and WhatsApp.
- [ ] `/llms.txt`, `/llms-full.txt` and a `.md` twin load.
- [ ] Google Search Console and Bing Webmaster Tools verified; sitemap submitted.
- [ ] `INDEXNOW_KEY` set; `/indexnow-key.txt` returns the key.
- [ ] Vercel Analytics shows page views and the "Email contact" / "Manufacturer page" events.

## Before switching on German

- [ ] Types, jobs, specs, pages, hub texts and the listings you want live have German text (switch the
      admin locale to Deutsch). Key facts and document titles translated.
- [ ] `messages/de.json` reviewed by a native speaker.
- [ ] Set `NEXT_PUBLIC_LOCALES=en,de`, redeploy, check hreflang pairs and `/de/…` sitemaps.
