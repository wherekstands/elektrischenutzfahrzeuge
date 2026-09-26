# Editing handbook

Everything is edited at `/admin`. Changes go live when published; the public pages refresh within
seconds. Use **Preview** (top right of a listing or guide) to see a draft on the real page layout.

## Roles

| Role | Can |
|---|---|
| Admin | Everything, including users, billing and site settings |
| Editor | Create, edit and publish all content; handle corrections and partner drafts |
| Partner | See and edit their own brand's listings and brand profile. Every save is a **draft** that staff review. Cannot publish, delete, see other brands, placements or billing fields. |

Create partner accounts in Users (role *Manufacturer partner*, pick the brand). The first account created
on an empty database becomes admin.

## Listings

One listing per model **version** (e.g. each battery size). Versions of the same model share a *Model
family* and link to each other.

**Vehicle tab.** Brand, model (without brand), family, **one** vehicle type (decides the spec rows),
availability, all jobs it is genuinely used for, and a one- or two-sentence factual summary (cards,
search, page intro). Title and slug are generated from brand + model.

**Specifications tab.** Only the rows of the chosen type appear; key figures are marked. Enter values in
the unit shown ("71,2" and "71.2" both work). Leave a field empty when there is no source: the site shows
"Not published" and invites corrections. Out-of-range values are flagged while editing and block
publishing.

**Highlights tab.**
- *Key facts* (3 lines, max 90 characters): factual and checkable, written by us, shown for every listing.
- *Key benefits* (3 lines): the manufacturer's own words, shown only while the brand has an active **Pro**
  partnership, labelled "According to <brand>".

**Photos & documents tab.**
- Photos: at least 1,200 px wide, landscape. The site crops to 4:3 (cards, gallery) and 1200×630 (share
  image); set the **focal point** so the vehicle stays centred. First photo = card photo. Order: side or
  three-quarter front view first, then rear, interior, work equipment, in use. Always fill *alt text*,
  *credit* and *licence* (manufacturer press kit, own photo, or licensed). Without photos the page shows a
  neutral drawing of the vehicle type.
- Documents (brochures, data sheets, price lists): shown for Starter and Pro partners. Upload a PDF or
  link to the manufacturer's file.

**Sources tab.** Manufacturer product page and further public sources (press releases, data sheets). The
*Data confirmed by manufacturer on* date (staff only) shows the "Data confirmed by <brand>" badge for 12
months while the brand has an active paid partnership. It means the manufacturer reviewed the data on
that date; it is not a quality seal. *Internal notes* are never shown publicly.

**SEO tab.** Leave empty. Titles and descriptions are generated from the key figures ("Kia PV5 Cargo Long
Range: range, battery & payload | ECV Base"). Override only if the generated text reads badly.

**Slug.** Stable. Changing it records a redirect from the old URL automatically.

## Corrections and the review queue

Partners & review → **Change requests** collects:

- *Correction*: from "Suggest a correction" on every listing (with field, current and proposed value,
  source, optional contact).
- *Partner draft*: a partner saved changes to a listing or their brand profile.
- *Claim*: a manufacturer asks to take over a listing.

Workflow: set status *In review* → check the source → edit the listing (for partner drafts open the
listing's **Versions** tab to compare the draft with the published version) → **Publish** → set the
request to *Applied* (or *Rejected* / *Spam*). Reply to the submitter by email when they left an address.

## Brands and partnerships

Brand profile: name, logo, country, website, short description, tagline and the **named contact** (name,
role, email, phone, region). The contact and the email button appear only for active Starter and Pro
partners; free listings show the manufacturer page link.

Partnership tab (staff): tier, valid until, subscription status. Stripe fills these automatically for
card payments; for invoiced partners set status **manual** and a *valid until* date. "Boost in
Recommended" and "Highlight cards" are on by default for paid tiers and can be switched off per brand.
**Billing** (also visible to the brand's partner users): *Choose Starter* / *Choose Pro* opens Stripe
Checkout (quantity = published models), *Invoices & payment method* opens the Stripe portal (plan changes,
cancellation), *Sync billed models* (staff) updates the quantity after adding or removing listings (no
proration).

## Placements (paid visibility)

Partners & review → Placements. Kinds: *Featured listing* (1–2 cards at the top of hubs and the home page,
labelled "Featured partner") and *Brand spotlight* (one brand box on type/job hubs or guides). Choose
where (home, the brand's own page, guides, specific types or jobs), start and end dates and priority
(higher wins). Placements only show while the brand's partnership is active and switch off automatically
at the end date. Remove all demo placements before launch.

## Taxonomy, hubs and landing pages

See [taxonomy.md](taxonomy.md). Hub texts live on the type or job entry: short description (cards, meta),
intro (80–200 words, shown above the results), FAQs (3–5), synonyms (search). *Landing pages* (Content)
create curated type × job pages; add one when a combination has at least three listings.

## Guides and pages

Content → Guides: title, excerpt, hero image, rich text, FAQs, author, related types/jobs/vehicles. Link internally
with English paths (`/en/types/vans`); they are rewritten for other languages.

Content → Pages (About, Methodology, How ranking works, For manufacturers, Imprint, Privacy, Partner terms, Open
data) are fixed by key. Keep *How ranking works* in sync with the actual ranking (docs/architecture.md).

## Translations

Switch the admin locale (top right) to **Deutsch** and fill the localized fields. A listing appears on the
German site once it has a German summary; types and jobs need a German name and slug. Key facts and
document titles fall back to English when empty, so translate them before switching German on.
Numbers and units are shared across languages.

## Redirects

System → Redirects. Slug changes of listings, brands and guides add entries automatically. Add entries
by hand when moving or merging types or jobs. Paths without locale (`/vehicles/old-slug`).
