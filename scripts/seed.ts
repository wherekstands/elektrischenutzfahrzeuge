/**
 * Seed the database with the initial taxonomy, spec definitions, the 68 reference listings,
 * trust pages, hub content and two guides.
 *
 *   pnpm seed          real data only (safe for production: no fictional partners)
 *   pnpm seed:demo     adds the fictional demo partners, contacts, benefits, documents and placements
 *   pnpm seed --fresh  deletes catalogue content first (never use on production)
 *
 * The script is idempotent: taxonomy, specs, brands and listings are matched by key/slug and updated.
 */
import './load-env'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'
import { GUIDES } from './seed/guides'
import { COMBOS, JOB_CONTENT, TYPE_CONTENT } from './seed/hubs'
import { PAGES } from './seed/pages'
import { SPECS } from './seed/specs'
import { JOBS, TYPES, type SeedJob, type SeedType } from './seed/taxonomy'

const args = new Set(process.argv.slice(2))
const DEMO = args.has('--demo')
const FRESH = args.has('--fresh')
const ctx = { skipRevalidate: true }

type Ref = { id: number }

// ─── reference catalogue (prototype export) ────────────────────────────────────────────────
type RefListing = {
  id: string
  brand: string
  name: string
  family: string
  categoryId: string
  apps: string[]
  status: 'on-sale' | 'orders-open' | 'announced' | 'discontinued'
  summary: string
  url?: string
  values: Record<string, unknown>
  facts?: string[]
  benefits?: string[]
  docs?: { title: string; kind: string; url: string; lang?: string; demo?: boolean }[]
  verifiedAt?: string
  updatedAt: string
}
type RefPartner = {
  brand: string
  tier: 'starter' | 'pro'
  validUntil?: string
  demo?: boolean
  contact: { name?: string; role?: string; region?: string; email?: string; phone?: string }
}
const catalog = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'reference/catalog.json'), 'utf8')) as {
  notice: string
  listings: RefListing[]
  partners: RefPartner[]
}

const CATEGORY_MAP: Record<string, string | ((l: RefListing) => string)> = {
  'van-small': 'small-vans',
  'van-mid': 'mid-size-vans',
  'van-large': 'large-vans',
  pickup: 'pickup-trucks',
  utv: 'utvs',
  'cargo-bikes': 'cargo-bikes',
  'light-utility': 'light-utility-vehicles',
  'truck-light': 'light-trucks',
  'truck-medium': 'medium-trucks',
  'truck-heavy': (l) => (l.id === 'mercedes-eeconic' ? 'refuse-trucks' : 'heavy-trucks'),
  'truck-tractor': 'tractor-units',
  'bus-mini': 'minibuses',
  'bus-city': 'city-buses',
  'bus-artic': 'articulated-buses',
  'bus-coach': 'coaches',
  carriers: 'multi-purpose-transporters',
  sweepers: 'street-sweepers',
  excavators: (l) => (Number(l.values.op_weight_kg ?? 99999) <= 6000 ? 'mini-excavators' : 'excavators'),
  loaders: 'wheel-loaders',
  telehandlers: 'telehandlers',
  dumpers: 'dumpers',
  rollers: 'rollers',
  platforms: 'aerial-work-platforms',
  'ag-tractors': 'tractors',
  'yard-loaders': 'yard-loaders',
  'slope-mowers': 'slope-mowers',
  'ride-mowers': 'ride-on-mowers',
  terminal: 'terminal-tractors',
  forklifts: (l) => (Number(l.values.lift_kg ?? 0) > 5000 ? 'heavy-forklifts' : 'forklifts'),
  'tow-tractors': 'tow-tractors',
  gse: 'airport-gse',
}

const COMPACT_MACHINE_TYPES = new Set(['mini-excavators', 'wheel-loaders', 'compact-loaders', 'telehandlers', 'dumpers'])

function mapJobs(l: RefListing, typeKey: string): string[] {
  const out = new Set<string>()
  const simple: Record<string, string> = {
    lastmile: 'last-mile-delivery',
    'urban-dist': 'urban-distribution',
    regional: 'regional-distribution',
    longhaul: 'long-haul',
    temp: 'refrigerated-transport',
    port: 'ports-terminals',
    warehouse: 'intralogistics',
    'urban-pt': 'city-bus',
    intercity: 'intercity',
    coach: 'coach-tourism',
    shuttle: 'shuttles',
    earthmoving: 'earthmoving',
    material: 'site-material-handling',
    roadbuild: 'road-construction',
    civil: 'utility-works',
    waste: 'waste-collection',
    streetclean: 'street-cleaning',
    winter: 'winter-service',
    parks: 'parks',
    roadmaint: 'road-maintenance',
    arable: 'arable-farming',
    farmyard: 'livestock-farming',
    vine: 'vineyards-orchards',
    forestry: 'forestry',
    trade: 'trades',
    service: 'service-fleets',
    rental: 'rental',
    airport: 'airport-ground-handling',
    fire: 'fire-rescue',
    industrialsite: 'industrial-sites',
  }
  for (const app of l.apps) {
    if (simple[app]) out.add(simple[app])
    else if (app === 'innercity') {
      // Prototype category "Inner-city & indoor sites" → both jobs for compact machines.
      out.add('zero-emission-sites')
      if (COMPACT_MACHINE_TYPES.has(typeKey)) out.add('indoor-work')
    } else if (app === 'slopes') {
      // Prototype category "Landscaping & slopes".
      out.add(typeKey === 'slope-mowers' || typeKey === 'utvs' ? 'slope-mowing' : 'landscaping')
    } else console.warn(`  ! unmapped application "${app}" on ${l.id}`)
  }
  return [...out]
}

const IMPLEMENTS = new Set(['sweeper', 'plough', 'spreader', 'mower', 'bucket', 'forks', 'hitch'])

function mapValues(l: RefListing, typeKey: string): Record<string, unknown> {
  const v: Record<string, unknown> = { energy_source: 'bev' }
  for (const [key, value] of Object.entries(l.values)) {
    switch (key) {
      case 'top_speed':
        v.top_speed_kmh = value
        break
      case 'charging':
        v.charging = (value as string[]).map((c) => (c === 'socket' ? 'cee' : c))
        break
      case 'body': {
        const all = value as string[]
        const body = all.filter((b) => !IMPLEMENTS.has(b))
        const implementsList = all.filter((b) => IMPLEMENTS.has(b))
        if (body.length) v.body = body
        if (implementsList.length) v.implements = implementsList
        break
      }
      case 'gvw_t':
        // The prototype stored GCW for tractor units in the GVW field.
        if (typeKey === 'tractor-units' || typeKey === 'terminal-tractors') v.gcw_t = value
        else v.gvw_t = value
        break
      default:
        v[key] = value
    }
  }
  if (l.id === 'mercedes-eeconic') v.body = [...new Set([...((v.body as string[]) ?? []), 'lowentry'])]
  return v
}

/** Country of origin for the brands in the reference catalogue. */
const BRAND_COUNTRY: Record<string, string> = {
  Renault: 'France',
  Peugeot: 'France',
  Ford: 'United States',
  Kia: 'South Korea',
  Volkswagen: 'Germany',
  'Mercedes-Benz': 'Germany',
  Opel: 'Germany',
  'Fiat Professional': 'Italy',
  Isuzu: 'Japan',
  Maxus: 'China',
  FUSO: 'Japan',
  IVECO: 'Italy',
  Volvo: 'Sweden',
  MAN: 'Germany',
  'Renault Trucks': 'France',
  DAF: 'Netherlands',
  Solaris: 'Poland',
  Polaris: 'United States',
  Goupil: 'France',
  'Bucher Municipal': 'Switzerland',
  'Aebi Schmidt': 'Switzerland',
  'Volvo CE': 'Sweden',
  JCB: 'United Kingdom',
  'Wacker Neuson': 'Germany',
  Fendt: 'Germany',
  Weidemann: 'Germany',
  Terberg: 'Netherlands',
  Kalmar: 'Finland',
  'Linde Material Handling': 'Germany',
  MULAG: 'Germany',
}

const slugify = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ─── helpers ────────────────────────────────────────────────────────────────────────────────
async function findOne(payload: Payload, collection: string, field: string, value: unknown) {
  const res = await payload.find({
    collection: collection as 'specs',
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    locale: 'en',
    draft: true,
  })
  return res.docs[0] as unknown as (Ref & Record<string, unknown>) | undefined
}

async function upsert(
  payload: Payload,
  collection: string,
  match: { field: string; value: unknown },
  data: Record<string, unknown>,
  opts: { draft?: boolean } = {},
): Promise<Ref & Record<string, unknown>> {
  const existing = await findOne(payload, collection, match.field, match.value)
  const common = { collection: collection as 'specs', depth: 0, locale: 'en' as const, context: ctx, overrideAccess: true }
  if (existing) {
    return (await payload.update({ ...common, id: existing.id, data: data as never, draft: opts.draft })) as never
  }
  return (await payload.create({ ...common, data: data as never, draft: opts.draft })) as never
}

let editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>
const md = (markdown: string) => convertMarkdownToLexical({ editorConfig, markdown: markdown.trim() })

// ─── main ───────────────────────────────────────────────────────────────────────────────────
async function main() {
  const payload = await getPayload({ config })
  editorConfig = await editorConfigFactory.default({ config: payload.config })
  const log = (msg: string) => console.log(`[seed] ${msg}`)

  if (FRESH) {
    if (process.env.VERCEL_ENV === 'production' || process.env.SITE_ENV === 'production') {
      throw new Error('Refusing --fresh on production')
    }
    log('Deleting catalogue content (--fresh)…')
    for (const c of [
      'placements',
      'change-requests',
      'landing-pages',
      'guides',
      'listings',
      'brands',
      'jobs',
      'vehicle-types',
      'specs',
      'pages',
      'redirects',
    ] as const) {
      // Children before parents for self-referencing taxonomies.
      if (c === 'jobs' || c === 'vehicle-types') {
        await payload.delete({ collection: c, where: { parent: { exists: true } }, context: ctx, overrideAccess: true })
      }
      await payload.delete({ collection: c, where: { id: { exists: true } }, context: ctx, overrideAccess: true })
    }
  }

  // Admin account
  const { totalDocs: userCount } = await payload.count({ collection: 'users' })
  if (userCount === 0 && process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    await payload.create({
      collection: 'users',
      data: { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD, name: 'Admin', role: 'admin' },
      context: ctx,
    })
    log(`Created admin ${process.env.SEED_ADMIN_EMAIL}`)
  }

  // ── Specs ──
  log(`Specs (${SPECS.length})…`)
  const specId = new Map<string, number>()
  for (const s of SPECS) {
    const doc = await upsert(payload, 'specs', { field: 'key', value: s.key }, {
      key: s.key,
      urlKey: s.urlKey,
      label: s.label,
      shortLabel: s.shortLabel ?? null,
      help: s.help ?? null,
      dataType: s.dataType,
      unit: s.unit ?? null,
      unitCode: s.unitCode ?? null,
      decimals: s.decimals ?? null,
      group: s.group,
      order: s.order,
      universal: Boolean(s.universal),
      filterable: s.filterable ?? true,
      showInCompare: s.showInCompare ?? true,
      better: s.better ?? 'none',
      min: s.min ?? null,
      max: s.max ?? null,
      options: s.options ?? [],
      quickFilter: s.quickFilter
        ? { enabled: true, min: s.quickFilter.min ?? null, label: s.quickFilter.label }
        : { enabled: false },
    })
    specId.set(s.key, doc.id)
    // German labels (options keep their row ids).
    const rows = (doc.options as { id: string; value: string; label: string }[] | undefined) ?? []
    await payload.update({
      collection: 'specs',
      id: doc.id,
      locale: 'de',
      context: ctx,
      data: {
        label: s.de.label,
        shortLabel: s.de.shortLabel ?? null,
        help: s.de.help ?? null,
        options: rows.map((r) => ({ id: r.id, value: r.value, label: s.de.options?.[r.value] ?? r.label })),
        ...(s.quickFilter ? { quickFilter: { enabled: true, min: s.quickFilter.min ?? null, label: s.quickFilter.de } } : {}),
      },
    })
  }
  const specRefs = (keys?: string[]) => (keys ?? []).map((k) => {
    const id = specId.get(k)
    if (!id) throw new Error(`Unknown spec ${k}`)
    return id
  })

  // ── Vehicle types ──
  log('Vehicle types…')
  const typeId = new Map<string, number>()
  const saveType = async (t: SeedType, order: number, parent?: number) => {
    const content = TYPE_CONTENT[t.key]
    const doc = await upsert(payload, 'vehicle-types', { field: 'slug', value: t.en.slug }, {
      name: t.en.name,
      slug: t.en.slug,
      shortDescription: t.en.short ?? null,
      synonyms: t.en.synonyms ?? null,
      parent: parent ?? null,
      order,
      illustration: t.illustration ?? null,
      specs: specRefs(t.specs),
      keyFigures: specRefs(t.keyFigures),
      intro: content ? md(content.intro) : null,
      faqs: content?.faqs ?? [],
    })
    typeId.set(t.key, doc.id)
    await payload.update({
      collection: 'vehicle-types',
      id: doc.id,
      locale: 'de',
      context: ctx,
      data: { name: t.de.name, slug: t.de.slug, shortDescription: t.de.short ?? null, synonyms: t.de.synonyms ?? null },
    })
    return doc.id
  }
  for (const [i, group] of TYPES.entries()) {
    const gid = await saveType(group, (i + 1) * 10)
    for (const [j, child] of (group.children ?? []).entries()) await saveType(child, (i + 1) * 10 + j + 1, gid)
  }
  // Cross-listing needs all groups to exist.
  for (const group of TYPES) {
    for (const child of group.children ?? []) {
      if (child.alsoIn?.length) {
        await payload.update({
          collection: 'vehicle-types',
          id: typeId.get(child.key)!,
          context: ctx,
          data: { alsoListedIn: child.alsoIn.map((k) => typeId.get(k)!) },
        })
      }
    }
  }

  // ── Jobs ──
  log('Jobs…')
  const jobId = new Map<string, number>()
  const saveJob = async (j: SeedJob, order: number, parent?: number) => {
    const content = JOB_CONTENT[j.key]
    const doc = await upsert(payload, 'jobs', { field: 'slug', value: j.en.slug }, {
      name: j.en.name,
      slug: j.en.slug,
      shortDescription: j.en.short ?? null,
      synonyms: j.en.synonyms ?? null,
      parent: parent ?? null,
      order,
      illustration: j.illustration ?? null,
      typicalTypes: (j.typical ?? []).map((k) => typeId.get(k)).filter(Boolean),
      intro: content ? md(content.intro) : null,
      faqs: content?.faqs ?? [],
    })
    jobId.set(j.key, doc.id)
    await payload.update({
      collection: 'jobs',
      id: doc.id,
      locale: 'de',
      context: ctx,
      data: { name: j.de.name, slug: j.de.slug, shortDescription: j.de.short ?? null, synonyms: j.de.synonyms ?? null },
    })
  }
  for (const [i, area] of JOBS.entries()) {
    await saveJob(area, (i + 1) * 10)
    for (const [k, job] of (area.children ?? []).entries()) await saveJob(job, (i + 1) * 10 + k + 1, jobId.get(area.key))
  }

  // ── Brands ──
  log('Brands…')
  const brandId = new Map<string, number>()
  const partners = new Map(catalog.partners.map((p) => [p.brand, p]))
  const brandNames = [...new Set(catalog.listings.map((l) => l.brand))].sort()
  for (const name of brandNames) {
    const firstUrl = catalog.listings.find((l) => l.brand === name && l.url)?.url
    const partner = DEMO ? partners.get(name) : undefined
    const doc = await upsert(
      payload,
      'brands',
      { field: 'name', value: name },
      {
        name,
        slug: slugify(name),
        country: BRAND_COUNTRY[name] ?? null,
        website: firstUrl ? new URL(firstUrl).origin : null,
        _status: 'published',
        demo: Boolean(partner?.demo),
        ...(partner
          ? {
              contact: partner.contact,
              tagline: partner.brand === 'Volvo CE' ? 'Compact electric machines for zero-emission sites' : null,
              partnership: {
                tier: partner.tier,
                validUntil: partner.validUntil ?? null,
                subscriptionStatus: 'manual',
                boostInRecommended: true,
                highlightCards: true,
              },
            }
          : { partnership: { tier: 'free', subscriptionStatus: 'none', boostInRecommended: true, highlightCards: true } }),
      },
    )
    brandId.set(name, doc.id)
  }

  // ── Listings ──
  log(`Listings (${catalog.listings.length})…`)
  for (const l of catalog.listings) {
    const mapped = CATEGORY_MAP[l.categoryId]
    const typeKey = typeof mapped === 'function' ? mapped(l) : mapped
    if (!typeKey || !typeId.has(typeKey)) throw new Error(`No type for ${l.id} (${l.categoryId})`)
    const jobs = mapJobs(l, typeKey).map((k) => {
      const id = jobId.get(k)
      if (!id) throw new Error(`Unknown job ${k}`)
      return id
    })
    const realDocs = (l.docs ?? []).filter((d) => !d.demo)
    const demoDocs = DEMO ? (l.docs ?? []).filter((d) => d.demo) : []
    const slug = slugify(`${l.brand} ${l.name}`)
    await upsert(
      payload,
      'listings',
      { field: 'slug', value: slug },
      {
        brand: brandId.get(l.brand),
        model: l.name,
        family: l.family,
        slug,
        vehicleType: typeId.get(typeKey),
        jobs,
        availability: l.status,
        summary: l.summary,
        specs: mapValues(l, typeKey),
        keyFacts: (l.facts ?? []).slice(0, 3).map((text) => ({ text })),
        keyBenefits: DEMO ? (l.benefits ?? []).slice(0, 3).map((text) => ({ text })) : [],
        sourceUrl: l.url ?? null,
        // Public brochures compiled by us are sources, not partner documents.
        sources: realDocs.map((d) => ({ label: `${d.title} (${d.kind === 'brochure' ? 'PDF brochure' : d.kind})`, url: d.url })),
        documents: demoDocs.map((d) => ({ title: d.title, kind: d.kind, language: d.lang ?? 'en', url: d.url })),
        verifiedAt: DEMO && l.verifiedAt ? l.verifiedAt : null,
        demo: DEMO && Boolean(l.benefits?.length || demoDocs.length || l.verifiedAt),
        _status: 'published',
      },
    )
  }

  // ── Curated type × job pages ──
  log('Type × job pages…')
  for (const c of COMBOS) {
    const vt = typeId.get(c.type)!
    const jb = jobId.get(c.job)!
    const existing = await payload.find({
      collection: 'landing-pages',
      where: { and: [{ vehicleType: { equals: vt } }, { job: { equals: jb } }] },
      limit: 1,
      depth: 0,
    })
    const data = { vehicleType: vt, job: jb, title: c.title, intro: md(c.intro), _status: 'published' as const }
    if (existing.docs[0]) await payload.update({ collection: 'landing-pages', id: existing.docs[0].id, data, context: ctx })
    else await payload.create({ collection: 'landing-pages', data, context: ctx })
  }

  // ── Pages ──
  log('Trust & legal pages…')
  for (const p of PAGES) {
    await upsert(payload, 'pages', { field: 'key', value: p.key }, {
      key: p.key,
      title: p.title,
      intro: p.intro ?? null,
      content: md(p.markdown),
      faqs: p.faqs ?? [],
    })
  }

  // ── Guides ──
  log('Guides…')
  for (const g of GUIDES) {
    await upsert(payload, 'guides', { field: 'slug', value: g.slug }, {
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt,
      content: md(g.markdown),
      faqs: g.faqs,
      relatedTypes: g.relatedTypes.map((k) => typeId.get(k)).filter(Boolean),
      relatedJobs: g.relatedJobs.map((k) => jobId.get(k)).filter(Boolean),
      publishedAt: '2026-09-26T00:00:00.000Z',
      _status: 'published',
    })
  }

  // ── Globals ──
  log('Settings & pricing…')
  await payload.updateGlobal({
    slug: 'settings',
    context: ctx,
    data: {
      tagline: 'Electric commercial vehicles and machines for Europe',
      notice: catalog.notice,
      contactEmail: 'hello@elektrischenutzfahrzeuge.de',
      partnersEmail: 'partners@elektrischenutzfahrzeuge.de',
      organization: { legalName: 'ECV Base' },
      openDataEnabled: false,
      openDataLicence: 'CC BY 4.0',
    },
  })
  await payload.updateGlobal({
    slug: 'pricing',
    context: ctx,
    data: {
      note: 'Prices are net, per listed model and year. Working assumption, to be confirmed.',
      tiers: [
        {
          tier: 'free',
          name: 'Free',
          pricePerModelYear: 0,
          description: 'Every model is listed',
          features: [
            { text: 'Listing with all specs, photos and applications', included: true },
            { text: 'Three key facts, checked by us', included: true },
            { text: 'Corrections via "Suggest a correction"', included: true },
            { text: 'Named contact person with email and phone', included: false },
            { text: '"Data confirmed by <brand>" badge', included: false },
            { text: 'Benefits section and featured placement', included: false },
          ],
        },
        {
          tier: 'starter',
          name: 'Starter',
          pricePerModelYear: 20,
          description: 'A real person behind every model',
          features: [
            { text: 'Everything in Free', included: true },
            { text: 'Named contact person with email and phone', included: true },
            { text: '"Data confirmed by <brand>" badge, valid 12 months', included: true },
            { text: 'Brochures, data sheets and price lists', included: true },
            { text: 'Partner portal: edit your own listings', included: true },
            { text: 'Higher position in "Recommended" (labelled)', included: true },
            { text: 'Benefits section and featured placement', included: false },
          ],
        },
        {
          tier: 'pro',
          name: 'Pro',
          pricePerModelYear: 40,
          highlight: true,
          description: 'Maximum visibility',
          features: [
            { text: 'Everything in Starter', included: true },
            { text: 'Three key benefits in your own words', included: true },
            { text: 'Top position in "Recommended" (labelled)', included: true },
            { text: 'Eligible for featured slots and brand spotlight', included: true },
            { text: 'Priority support', included: true },
            { text: 'Views and contact statistics (coming soon)', included: true },
          ],
        },
      ],
    },
  })

  // ── Demo placements ──
  if (DEMO) {
    log('Demo placements…')
    const kiaLr = await findOne(payload, 'listings', 'slug', 'kia-pv5-cargo-long-range')
    const volvoCe = brandId.get('Volvo CE')
    const ecr25 = await findOne(payload, 'listings', 'slug', 'volvo-ce-ecr25-electric')
    const today = new Date()
    const inAYear = new Date(today.getTime() + 365 * 86400000)
    const placements = [
      kiaLr && {
        name: 'Demo: Kia PV5 on vans hub and home',
        kind: 'featured-listing',
        brand: brandId.get('Kia'),
        listings: [kiaLr.id],
        onHome: true,
        vehicleTypes: [typeId.get('vans')],
        jobs: [jobId.get('last-mile-delivery')],
      },
      ecr25 && {
        name: 'Demo: Volvo CE ECR25 on construction hub',
        kind: 'featured-listing',
        brand: volvoCe,
        listings: [ecr25.id],
        vehicleTypes: [typeId.get('construction')],
        jobs: [jobId.get('zero-emission-sites')],
      },
      {
        name: 'Demo: Volvo CE brand spotlight',
        kind: 'brand-spotlight',
        brand: volvoCe,
        vehicleTypes: [typeId.get('construction')],
        onGuides: true,
      },
    ].filter(Boolean) as Record<string, unknown>[]
    for (const p of placements) {
      await upsert(payload, 'placements', { field: 'name', value: p.name }, {
        ...p,
        startsAt: today.toISOString(),
        endsAt: inAYear.toISOString(),
        active: true,
        priority: 1,
        note: 'Fictional demo placement. Delete before launch.',
      })
    }
  }

  log(`Done${DEMO ? ' (with demo partner data)' : ''}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
