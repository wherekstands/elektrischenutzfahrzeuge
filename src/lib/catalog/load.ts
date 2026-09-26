import 'server-only'

import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type {
  Brand as BrandDoc,
  Document as DocumentDoc,
  Job as JobDoc,
  LandingPage as LandingDoc,
  Listing as ListingDoc,
  Media as MediaDoc,
  Placement as PlacementDoc,
  Spec as SpecDoc,
  VehicleType as TypeDoc,
} from '@/payload-types'

import { DEFAULT_LOCALE, type Locale } from '../../i18n/config'
import { SPEC_GROUPS, type Illustration, type Tier } from '../constants'
import type { SpecValues } from '../specs/normalize'
import { partnershipState, startOfToday } from './partnership'
import type {
  Brand,
  CatalogData,
  Faq,
  ImageRef,
  JobNode,
  LandingPage,
  Listing,
  Placement,
  PricingTier,
  SpecDef,
  TypeNode,
} from './types'

export const getPayloadClient = () => getPayload({ config: configPromise })

const idOf = (v: unknown): number | null =>
  v == null ? null : typeof v === 'object' ? ((v as { id?: number }).id ?? null) : (v as number)

const ids = (v: unknown): number[] => (Array.isArray(v) ? v.map(idOf).filter((x): x is number => x != null) : [])

const splitSynonyms = (s: string | null | undefined) =>
  (s ?? '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean)

const faqsOf = (v: unknown): Faq[] =>
  Array.isArray(v)
    ? v
        .filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string')
        .map((f) => ({ question: f.question, answer: f.answer }))
    : []

type FindArgs = {
  collection:
    | 'specs'
    | 'vehicle-types'
    | 'jobs'
    | 'brands'
    | 'listings'
    | 'media'
    | 'documents'
    | 'placements'
    | 'landing-pages'
    | 'redirects'
  locale: Locale
  /** Versioned collection: only published docs, or (preview) the latest drafts. */
  versioned?: boolean
  drafts?: boolean
}

async function findAll<T>(payload: Payload, { collection, locale, versioned, drafts }: FindArgs): Promise<T[]> {
  const res = await payload.find({
    collection,
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    ...(versioned && drafts ? { draft: true } : {}),
    ...(versioned && !drafts ? { where: { _status: { equals: 'published' } } } : {}),
  })
  return res.docs as T[]
}

/** Load both the requested locale and the default locale; missing localized values fall back to English. */
async function findLocalized<T extends { id: number }>(payload: Payload, args: FindArgs) {
  const own = await findAll<T>(payload, args)
  if (args.locale === DEFAULT_LOCALE) return { own, base: new Map(own.map((d) => [d.id, d])) }
  const base = await findAll<T>(payload, { ...args, locale: DEFAULT_LOCALE })
  return { own, base: new Map(base.map((d) => [d.id, d])) }
}

const pick = <T,>(own: T | null | undefined, base: T | null | undefined): T | null =>
  own != null && own !== '' && !(Array.isArray(own) && own.length === 0) ? own : (base ?? null)

function toImage(doc: MediaDoc | undefined, fallbackAlt?: string | null): ImageRef | null {
  if (!doc?.url) return null
  const sizes: ImageRef['sizes'] = {}
  for (const key of ['thumb', 'card', 'large', 'og'] as const) {
    const s = doc.sizes?.[key]
    if (s?.url && s.width && s.height) sizes[key] = { url: s.url, width: s.width, height: s.height }
  }
  return {
    id: doc.id,
    alt: doc.alt || fallbackAlt || '',
    credit: doc.credit ?? null,
    width: doc.width ?? 0,
    height: doc.height ?? 0,
    url: doc.url,
    sizes,
  }
}

/**
 * Build the catalogue for one locale. `drafts: true` (preview only, never cached) returns the latest
 * unpublished changes of listings, brands and type × job pages.
 */
export async function loadCatalog(locale: Locale, { drafts = false } = {}): Promise<CatalogData> {
  const payload = await getPayloadClient()

  // Sequential on purpose: keeps the connection pool small on serverless.
  const specsL = await findLocalized<SpecDoc>(payload, { collection: 'specs', locale })
  const typesL = await findLocalized<TypeDoc>(payload, { collection: 'vehicle-types', locale })
  const jobsL = await findLocalized<JobDoc>(payload, { collection: 'jobs', locale })
  const brandsL = await findLocalized<BrandDoc>(payload, { collection: 'brands', locale, versioned: true, drafts })
  const listingsL = await findLocalized<ListingDoc>(payload, { collection: 'listings', locale, versioned: true, drafts })
  const mediaL = await findLocalized<MediaDoc>(payload, { collection: 'media', locale })
  const docsL = await findLocalized<DocumentDoc>(payload, { collection: 'documents', locale })
  const placementDocs = await findAll<PlacementDoc>(payload, { collection: 'placements', locale })
  const landingsL = await findLocalized<LandingDoc>(payload, { collection: 'landing-pages', locale, versioned: true, drafts })
  const redirectDocs = await findAll<{ from: string; to: string }>(payload, { collection: 'redirects', locale })
  const settings = await payload.findGlobal({ slug: 'settings', locale, fallbackLocale: DEFAULT_LOCALE, depth: 1 })
  const pricing = await payload.findGlobal({ slug: 'pricing', locale, fallbackLocale: DEFAULT_LOCALE, depth: 0 })

  // ── Specs ──
  const groupRank = new Map(SPEC_GROUPS.map((g, i) => [g, i]))
  const specs: SpecDef[] = specsL.own
    .map((d) => {
      const b = specsL.base.get(d.id)
      const baseOptions = new Map((b?.options ?? []).map((o) => [o.value, o.label]))
      return {
        id: d.id,
        key: d.key,
        urlKey: d.urlKey,
        label: pick(d.label, b?.label) ?? d.key,
        shortLabel: pick(d.shortLabel, b?.shortLabel) ?? pick(d.label, b?.label) ?? d.key,
        help: pick(d.help, b?.help),
        dataType: d.dataType,
        unit: d.unit ?? null,
        unitCode: d.unitCode ?? null,
        decimals: d.decimals ?? null,
        group: d.group,
        order: d.order ?? 100,
        universal: Boolean(d.universal),
        filterable: d.filterable !== false,
        showInCompare: d.showInCompare !== false,
        better: d.better === 'high' || d.better === 'low' ? d.better : null,
        options: (d.options ?? []).map((o) => ({ value: o.value, label: pick(o.label, baseOptions.get(o.value)) ?? o.value })),
        quickFilter: d.quickFilter?.enabled
          ? { min: d.quickFilter.min ?? null, label: pick(d.quickFilter.label, b?.quickFilter?.label) ?? d.label }
          : null,
      } satisfies SpecDef
    })
    .sort((a, b) => (groupRank.get(a.group)! - groupRank.get(b.group)!) || a.order - b.order || a.key.localeCompare(b.key))
  const specById = new Map(specs.map((s) => [s.id, s]))
  const specOrder = new Map(specs.map((s, i) => [s.key, i]))
  const universalKeys = specs.filter((s) => s.universal).map((s) => s.key)

  // ── Vehicle types ──
  const rawTypes = typesL.own
  const typeRaw = new Map(rawTypes.map((t) => [t.id, t]))
  const typeSlug = (t: TypeDoc) => t.slug || null
  const types: TypeNode[] = rawTypes.map((t) => {
    const b = typesL.base.get(t.id)
    const parentId = idOf(t.parent)
    const parent = parentId ? typeRaw.get(parentId) : undefined
    const specKeysSet = new Set<string>(universalKeys)
    for (const id of [...ids(parent?.specs), ...ids(t.specs)]) {
      const s = specById.get(id)
      if (s) specKeysSet.add(s.key)
    }
    const ownFigures = ids(t.keyFigures)
    const figureIds = ownFigures.length ? ownFigures : ids(parent?.keyFigures)
    const keyFigures = figureIds.map((id) => specById.get(id)?.key).filter((k): k is string => Boolean(k))
    keyFigures.forEach((k) => specKeysSet.add(k))
    const slug = typeSlug(t)
    const parentSlug = parent ? typeSlug(parent) : null
    return {
      kind: 'type',
      id: t.id,
      slug: slug ?? typesL.base.get(t.id)?.slug ?? String(t.id),
      name: pick(t.name, b?.name) ?? '',
      shortDescription: pick(t.shortDescription, b?.shortDescription),
      parentId,
      order: t.order ?? 100,
      illustration: ((t.illustration ?? parent?.illustration ?? null) as Illustration | null),
      intro: (t.intro as TypeNode['intro']) ?? null,
      faqs: faqsOf(t.faqs),
      synonyms: [...splitSynonyms(t.synonyms), ...(locale !== DEFAULT_LOCALE ? splitSynonyms(b?.synonyms) : [])],
      seo: { title: t.seo?.title, description: t.seo?.description, noindex: t.seo?.noindex },
      path: parent ? [parentSlug ?? '', slug ?? ''] : [slug ?? ''],
      childIds: [],
      hasLocale: Boolean(t.name && slug && (!parent || parentSlug)),
      alsoListedIn: ids(t.alsoListedIn),
      specKeys: [...specKeysSet].sort((a, c) => (specOrder.get(a) ?? 999) - (specOrder.get(c) ?? 999)),
      keyFigures,
    }
  })
  types.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  const typeById = new Map(types.map((t) => [t.id, t]))
  for (const t of types) if (t.parentId) typeById.get(t.parentId)?.childIds.push(t.id)

  // ── Jobs ──
  const jobRaw = new Map(jobsL.own.map((j) => [j.id, j]))
  const jobs: JobNode[] = jobsL.own.map((j) => {
    const b = jobsL.base.get(j.id)
    const parentId = idOf(j.parent)
    const parent = parentId ? jobRaw.get(parentId) : undefined
    return {
      kind: 'job',
      id: j.id,
      slug: j.slug ?? b?.slug ?? String(j.id),
      name: pick(j.name, b?.name) ?? '',
      shortDescription: pick(j.shortDescription, b?.shortDescription),
      parentId,
      order: j.order ?? 100,
      illustration: ((j.illustration ?? parent?.illustration ?? null) as Illustration | null),
      intro: (j.intro as JobNode['intro']) ?? null,
      faqs: faqsOf(j.faqs),
      synonyms: [...splitSynonyms(j.synonyms), ...(locale !== DEFAULT_LOCALE ? splitSynonyms(b?.synonyms) : [])],
      seo: { title: j.seo?.title, description: j.seo?.description, noindex: j.seo?.noindex },
      path: parent ? [parent.slug ?? '', j.slug ?? ''] : [j.slug ?? ''],
      childIds: [],
      hasLocale: Boolean(j.name && j.slug && (!parent || parent.slug)),
      typicalTypeIds: ids(j.typicalTypes),
    }
  })
  jobs.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  const jobById = new Map(jobs.map((j) => [j.id, j]))
  for (const j of jobs) if (j.parentId) jobById.get(j.parentId)?.childIds.push(j.id)

  // ── Media & documents ──
  const mediaById = new Map(mediaL.own.map((m) => [m.id, m]))
  const mediaBase = mediaL.base
  const image = (id: number | null) => (id ? toImage(mediaById.get(id), mediaBase.get(id)?.alt) : null)
  const docById = new Map(docsL.own.map((d) => [d.id, d]))

  // ── Brands ──
  const today = startOfToday()
  const brands: Brand[] = brandsL.own.map((d) => {
    const b = brandsL.base.get(d.id)
    const state = partnershipState(d.partnership, today)
    const boostOn = d.partnership?.boostInRecommended !== false
    const contact = d.contact ?? b?.contact
    return {
      id: d.id,
      name: d.name,
      slug: d.slug ?? String(d.id),
      logo: image(idOf(d.logo)),
      country: d.country ?? null,
      website: d.website ?? null,
      description: pick(d.description, b?.description),
      tagline: pick(d.tagline, b?.tagline),
      contact: contact?.email
        ? {
            name: contact.name ?? null,
            role: pick(d.contact?.role, b?.contact?.role),
            email: contact.email ?? null,
            phone: contact.phone ?? null,
            region: pick(d.contact?.region, b?.contact?.region),
          }
        : null,
      tier: state.tier,
      partnerActive: state.active,
      boost: state.active && boostOn ? (state.tier === 'pro' ? 2 : 1) : 0,
      highlight: state.active && state.tier === 'pro' && d.partnership?.highlightCards !== false,
      demo: Boolean(d.demo),
    }
  })
  brands.sort((a, b) => a.name.localeCompare(b.name))
  const brandIds = new Set(brands.map((b) => b.id))

  // ── Listings ──
  const listings: Listing[] = []
  for (const d of listingsL.own) {
    const b = listingsL.base.get(d.id)
    const brandId = idOf(d.brand)
    const typeId = idOf(d.vehicleType)
    if (!brandId || !brandIds.has(brandId) || !typeId || !typeById.has(typeId) || !d.slug) continue
    const brand = brands.find((x) => x.id === brandId)!
    const keyFacts = (pick(d.keyFacts, b?.keyFacts) ?? []).map((f) => f.text).filter(Boolean)
    const keyBenefits = (pick(d.keyBenefits, b?.keyBenefits) ?? []).map((f) => f.text).filter(Boolean)
    const title = `${brand.name} ${d.model}`
    listings.push({
      id: d.id,
      slug: d.slug,
      brandId,
      model: d.model,
      family: d.family || null,
      title,
      typeId,
      jobIds: ids(d.jobs).filter((id) => jobById.has(id)),
      availability: d.availability,
      summary: pick(d.summary, b?.summary) ?? '',
      specs: (d.specs && typeof d.specs === 'object' && !Array.isArray(d.specs) ? d.specs : {}) as SpecValues,
      keyFacts,
      keyBenefits,
      images: ids(d.images)
        .map((id) => image(id))
        .filter((x): x is ImageRef => Boolean(x))
        .map((img) => ({ ...img, alt: img.alt || title })),
      documents: (d.documents ?? [])
        .map((doc, i): Listing['documents'][number] | null => {
          const baseDoc = b?.documents?.[i]
          const file = docById.get(idOf(doc.file) ?? -1)
          const url = file?.url || doc.url
          return url
            ? { title: pick(doc.title, baseDoc?.title) ?? 'Document', kind: doc.kind, language: doc.language ?? null, url }
            : null
        })
        .filter((x): x is Listing['documents'][number] => Boolean(x)),
      sourceUrl: d.sourceUrl ?? null,
      sources: (d.sources ?? []).map((s) => ({ label: s.label, url: s.url })),
      verifiedAt: d.verifiedAt ?? null,
      updatedAt: d.updatedAt,
      createdAt: d.createdAt,
      seo: { title: d.seo?.title, description: d.seo?.description, noindex: d.seo?.noindex },
      demo: Boolean(d.demo),
      hasLocale: Boolean(d.summary),
    })
  }

  // ── Placements (date range checked again at render time) ──
  const now = Date.now()
  const placements: Placement[] = placementDocs
    .filter((p) => p.active !== false && new Date(p.startsAt).getTime() <= now && new Date(p.endsAt).getTime() >= now)
    .map((p) => ({
      id: p.id,
      kind: p.kind,
      brandId: idOf(p.brand)!,
      listingIds: ids(p.listings),
      onHome: Boolean(p.onHome),
      onBrandHub: Boolean(p.onBrandHub),
      onGuides: Boolean(p.onGuides),
      typeIds: ids(p.vehicleTypes),
      jobIds: ids(p.jobs),
      priority: p.priority ?? 0,
    }))
    .filter((p) => brands.find((b) => b.id === p.brandId)?.partnerActive)
    .sort((a, b) => b.priority - a.priority)

  const landings: LandingPage[] = landingsL.own
    .map((l) => {
      const b = landingsL.base.get(l.id)
      return {
        id: l.id,
        typeId: idOf(l.vehicleType)!,
        jobId: idOf(l.job)!,
        title: pick(l.title, b?.title),
        intro: (l.intro as LandingPage['intro']) ?? null,
        faqs: faqsOf(l.faqs),
        seo: { title: l.seo?.title, description: l.seo?.description, noindex: l.seo?.noindex },
        hasLocale: locale === DEFAULT_LOCALE || Boolean(l.title),
      }
    })
    .filter((l) => typeById.has(l.typeId) && jobById.has(l.jobId))

  const orgLogo = settings.organization?.logo && typeof settings.organization.logo === 'object' ? settings.organization.logo : null

  return {
    locale,
    generatedAt: new Date().toISOString(),
    specs,
    types,
    jobs,
    brands,
    listings,
    placements,
    landings,
    settings: {
      tagline: settings.tagline ?? null,
      notice: settings.notice ?? null,
      contactEmail: settings.contactEmail ?? null,
      partnersEmail: settings.partnersEmail ?? null,
      organization: {
        legalName: settings.organization?.legalName ?? null,
        logoUrl: (orgLogo as MediaDoc | null)?.url ?? null,
        sameAs: (settings.organization?.sameAs ?? []).map((s) => s.url).filter(Boolean),
      },
      owner: {
        name: settings.owner?.name ?? null,
        role: settings.owner?.role ?? null,
        bio: settings.owner?.bio ?? null,
        url: settings.owner?.url ?? null,
      },
      openDataEnabled: Boolean(settings.openDataEnabled),
      openDataLicence: settings.openDataLicence ?? null,
    },
    pricing: {
      tiers: (pricing.tiers ?? []).map(
        (t): PricingTier => ({
          tier: t.tier as Tier,
          name: t.name || t.tier.charAt(0).toUpperCase() + t.tier.slice(1),
          pricePerModelYear: t.pricePerModelYear ?? null,
          highlight: Boolean(t.highlight),
          description: t.description ?? null,
          features: (t.features ?? []).map((f) => ({ text: f.text, included: f.included !== false })),
        }),
      ),
      note: pricing.note ?? null,
    },
    redirects: Object.fromEntries(redirectDocs.map((r) => [r.from, r.to])),
  }
}
