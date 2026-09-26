/**
 * Initial content for the fixed trust and legal pages (English). Written in Markdown and converted to
 * Lexical rich text by the seed. Editors maintain them afterwards in the admin (Content → Trust & legal pages).
 * Items marked [TO COMPLETE] must be filled in before launch (see docs/launch-checklist.md).
 */
export type SeedPage = {
  key: string
  title: string
  intro?: string
  markdown: string
  faqs?: { question: string; answer: string }[]
}

export const PAGES: SeedPage[] = [
  {
    key: 'about',
    title: 'About ECV Base',
    intro:
      'ECV Base is an independent directory of electric commercial vehicles and machines for Europe: vans, trucks, buses, municipal, construction, agricultural and industrial machines.',
    markdown: `
## Why this directory exists

Fleet managers, municipalities, contractors and farmers who want to go electric face the same problem: the facts are scattered across hundreds of brochures, press releases and configurators, and every manufacturer presents them differently. ECV Base puts them side by side in one consistent format, so you can shortlist the right vehicles for your job in minutes and contact the manufacturer directly.

## What you can do here

- **Find** vehicles by type ("electric 7.5 t truck") or by job ("street cleaning", "quiet night delivery").
- **Compare** up to four vehicles side by side, with the best value in each row marked and an option to show differences only.
- **Save** vehicles to a shortlist you can share with colleagues.
- **Contact** manufacturers directly by email. We do not sit in between and do not sell your data.

## Independence

Every model is listed free of charge, whether or not the manufacturer pays. Manufacturers can book a partnership for a named contact, a "Data confirmed" badge, documents, benefits and more visibility. Paid visibility is always labelled, and payment never changes spec values or explicit sorting. See [How ranking works](/en/how-ranking-works) and our [methodology](/en/methodology).

## Who is behind ECV Base

[TO COMPLETE: name, background and why you run this site. A real, named person builds trust with buyers and search engines.]

## Contact

Found a mistake? Use "Suggest a correction" on any listing. For everything else, write to us at the address in the [imprint](/en/legal/imprint).
`,
  },
  {
    key: 'methodology',
    title: 'Methodology',
    intro: 'How we compile, check and update the data on ECV Base, and what each label means.',
    markdown: `
## Sources

We compile specifications from public manufacturer sources: product pages, technical data sheets, brochures, price lists and press releases, complemented by trade press where the manufacturer does not publish a figure. Each listing links to the manufacturer page and lists further sources used.

When a manufacturer partner reviews a listing, we record the date. The listing then shows **"Data confirmed by <brand> on <date>"**. This means the manufacturer checked the data on that date. It is not a quality seal, and it expires after 12 months or when the partnership ends.

## One listing per version

Where versions differ in key figures (for example battery size or gross weight), each version gets its own listing. Versions of the same model are linked as "Other versions".

## What the figures mean

- **Battery capacity** is the usable (net) capacity where the manufacturer publishes it.
- **Range** is the WLTP figure for vans and pickups, and the manufacturer's figure for trucks and buses. Real-world range depends on payload, temperature, speed and route.
- **Runtime** for machines is the manufacturer's figure for typical duty. Heavy work shortens it.
- **Price** is the net list price in Germany where published, excluding VAT and subsidies.
- **Not published** means we have not found a reliable public figure. We never estimate spec values.

## Charging time estimates

Where we show an estimated charging time, we calculate it from battery size and peak charging power with conservative assumptions (DC: 10–80 % at 80 % of peak power; AC: 0–100 % at 90 % of onboard charger power). Real charging times depend on the charging curve, battery temperature and charger. Where the manufacturer publishes a charging time, we show that figure instead.

## Updates and corrections

Every listing shows when it was last updated. Anyone can suggest a correction on each listing; we check the source before changing data. Manufacturers can correct their own listings through the partner portal; their edits are reviewed before publication.

## What we list

We list locally zero-emission commercial vehicles and machines available or announced for Europe: battery-electric, hydrogen fuel cell and cable-powered. We do not list hybrids. Warehouse trucks (pallet trucks, reach trucks, order pickers) are out of scope because they have been electric for decades.

## Languages and translation

Content is written in English first. Other languages are published only after a person has reviewed the translation.
`,
  },
  {
    key: 'how-ranking-works',
    title: 'How ranking works',
    intro:
      'This page explains the main parameters that decide the order of vehicles on ECV Base, including the influence of payment.',
    markdown: `
## The default order: "Recommended"

When you open a list of vehicles, it is sorted by **Recommended**. This order is determined by the following parameters, in order of importance:

1. **Paid partnership.** Listings of manufacturers with an active paid partnership are shown first: Pro partners before Starter partners, followed by all other listings. These listings are labelled **"Sponsored"**. This is the only place where payment influences the order.
2. **Search relevance.** If you search, listings that match your search terms better rank higher within each group.
3. **Availability.** Vehicles on sale come before vehicles with open order books, announced and discontinued vehicles.
4. **Data completeness.** Listings with more published key figures and specifications rank higher, because they are more useful for comparison.
5. **Vehicle type and name.** Remaining ties are sorted by vehicle type and then alphabetically.

## Orders you choose are purely data-based

When you choose an explicit sort such as range, battery, payload or price, vehicles are sorted **only by that value**. Listings without the value come last. Filters work the same way for everyone. Payment has no influence on explicit sorting, filters or search results beyond the "Recommended" order described above.

## Featured partners

Some pages show one or two **featured** vehicles or a brand spotlight at the top. These placements are paid, clearly labelled **"Featured partner"**, and links to manufacturer websites in these placements carry \`rel="sponsored"\`.

## What payment never changes

- Specification values, prices and availability.
- The "Similar vehicles" suggestions, which are based on vehicle type and key figures only.
- Whether a vehicle is listed at all: every model is listed free of charge.

## The "Data confirmed" badge

"Data confirmed by <brand>" means the manufacturer reviewed the data on the date shown. It requires a paid partnership and expires after 12 months. It is not a test result or quality seal.

## Legal background

We publish this information to meet the transparency requirements of the EU Platform-to-Business Regulation (EU) 2019/1150 and the EU and German rules on unfair commercial practices (including § 5b UWG). The same description is part of our partner terms.

Questions? Contact us via the address in the [imprint](/en/legal/imprint).
`,
  },
  {
    key: 'for-manufacturers',
    title: 'For manufacturers',
    intro:
      'Fleet managers, municipalities and contractors use ECV Base to shortlist electric vehicles. Every model is listed free. Partnerships add a named contact, confirmed data and more visibility.',
    markdown: `
## How confirmation works

1. **Get in touch.** Tell us which brand and models you want to manage.
2. **Review your data.** You get access to the partner portal and check your listings. Your edits are saved as drafts and we publish them after review.
3. **Badge goes live.** Your listings show "Data confirmed by <brand>" with the date, your named contact and your documents.
4. **Stay current.** Confirmation lasts 12 months. Update any time through the portal.

## Our independence rules

- Every model is listed free, whether or not the manufacturer pays.
- Payment never changes spec values or explicit sorting and filters.
- Paid visibility is always labelled "Sponsored" or "Featured partner".
- We may reject data we cannot verify, and we remove the badge when confirmation expires.
`,
    faqs: [
      {
        question: 'Do buyers contact us through ECV Base?',
        answer:
          'Buyers email your named contact directly from the listing. The subject line starts with "[ECV Base]" so you can recognise and measure these enquiries. We do not store or resell enquiries.',
      },
      {
        question: 'How is the partnership billed?',
        answer:
          'Per brand, per listed model and year, by card or SEPA via Stripe. You can manage invoices and payment details yourself in the partner portal.',
      },
      {
        question: 'Can we correct a listing without a partnership?',
        answer:
          'Yes. Use "Suggest a correction" on the listing and include a source. We check and update free listings too.',
      },
    ],
  },
  {
    key: 'imprint',
    title: 'Imprint',
    markdown: `
[TO COMPLETE before launch. German law (§ 5 DDG, § 18 MStV) requires the following. Have it reviewed.]

## Provider

[Name / company name and legal form]
[Street and number]
[Postcode and city]
[Country]

## Contact

Email: [address]
Phone: [number]

## Register and VAT

[Commercial register, register number] (if applicable)
VAT ID: [DE…] (if applicable)

## Responsible for content according to § 18 (2) MStV

[Name, address]

## Online dispute resolution

We are not obliged and not willing to participate in dispute resolution proceedings before a consumer arbitration board.
`,
  },
  {
    key: 'privacy',
    title: 'Privacy policy',
    intro: 'We collect as little data as possible. There are no advertising cookies and no tracking across websites.',
    markdown: `
[TEMPLATE: have this reviewed by a legal professional before launch and complete the controller details.]

## Controller

[Name and address as in the imprint]

## Hosting

This website is hosted by Vercel Inc. Server logs (IP address, time, requested page, browser) are processed to deliver the site securely and are deleted after a short period. Content and uploaded files are stored with Supabase in the EU (Frankfurt, Germany).

## Analytics without cookies

We use cookie-less, privacy-friendly analytics to count page views and clicks on "Email contact" and "Manufacturer page". No personal profiles are created and no cookies are set, so no consent banner is needed.

## Saved vehicles and comparisons

Your saved vehicles and comparison list are stored only in your browser (local storage). We do not receive them unless you share a link.

## Contacting manufacturers

The "Email" button opens your own email program with the manufacturer's address. Your message goes directly to the manufacturer; we do not see or store it.

## Correction suggestions

If you suggest a correction, we store your suggestion and, if you provide them, your name and email address to process it and to ask questions. We delete personal data from processed suggestions after 12 months.

## Manufacturer partners

For partner accounts we process name, email, company and billing data. Payments are processed by Stripe Payments Europe Ltd.

## Your rights

You have the right to access, rectification, erasure, restriction, data portability and objection, and the right to complain to a supervisory authority.
`,
  },
  {
    key: 'partner-terms',
    title: 'Partner terms',
    intro: 'Terms for manufacturer and importer partnerships on ECV Base.',
    markdown: `
[TEMPLATE: complete with your legal adviser before selling partnerships.]

## Services

Partnerships are booked per brand. Depending on the tier they include a named contact on every listing, the "Data confirmed by <brand>" badge, documents, key benefits, preferred position in the "Recommended" order and optional featured placements.

## Ranking and visibility

The main parameters determining ranking are described on [How ranking works](/en/how-ranking-works) and form part of these terms (Art. 5 Regulation (EU) 2019/1150). In short: an active paid partnership raises listings in the default "Recommended" order (Pro before Starter before free listings). Explicit sorts and filters chosen by visitors are purely data-based. Paid placements are labelled "Sponsored" or "Featured partner".

## Data

Partners are responsible for the accuracy of data they provide. ECV Base may reject data it cannot verify. Payment never changes spec values.

## Term and billing

Partnerships run for 12 months and renew unless cancelled. They are billed per listed model per year via Stripe.
`,
  },
  {
    key: 'data',
    title: 'Open data',
    intro: 'The ECV Base catalogue as a downloadable dataset for research, journalism and tools.',
    markdown: `
The dataset contains all published listings with their key specifications, vehicle types, jobs, availability and last update. Please credit **ECV Base** with a link when you use it.
`,
  },
]
