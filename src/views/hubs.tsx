import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { BrowseView } from '@/components/browse/BrowseView'
import { HubContent } from '@/components/hub/HubContent'
import { HubHeader } from '@/components/hub/HubHeader'
import { HubTable } from '@/components/hub/HubTable'
import { Spotlight } from '@/components/hub/Spotlight'
import { TaxonomyChips } from '@/components/hub/TaxonomyChips'
import { JsonLd } from '@/components/ui/JsonLd'
import { COMBO_SEGMENT, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import type { Catalog } from '@/lib/catalog/catalog'
import { emptyFilters, type FilterState, hasFacetParams, parseFilters } from '@/lib/catalog/filters'
import { formatDate, formatRange } from '@/lib/catalog/format'
import type { JobNode, Listing, SpecDef, TypeNode } from '@/lib/catalog/types'
import { MIN_LISTINGS_TO_INDEX_COMBO, MIN_LISTINGS_TO_INDEX_HUB } from '@/lib/constants'
import { breadcrumbLd, collectionPageLd, faqLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle, fitTitleCandidates } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'

import { alternates, lcFirst } from './shared'

export type SearchParams = Record<string, string | string[] | undefined>

// ── helpers ──────────────────────────────────────────────────────────────────────────────────

/** "Range: 288–416 km · Battery: 43–71.2 kWh" from the first key figures that have values. */
function statsLine(listings: Listing[], figures: SpecDef[], locale: Locale, max = 2): string {
  const parts: string[] = []
  for (const f of figures) {
    if (parts.length >= max) break
    const values = listings.map((l) => l.specs[f.key]).filter((v): v is number => typeof v === 'number')
    if (values.length < 1) continue
    const range = formatRange(values, f, locale)
    if (range) parts.push(`${f.shortLabel}: ${range}`)
  }
  return parts.join(' · ')
}

function summary(
  t: Awaited<ReturnType<typeof getTranslations<'hub'>>>,
  listings: Listing[],
  figures: SpecDef[],
  locale: Locale,
  updated: string | null,
) {
  const brands = new Set(listings.map((l) => l.brandId)).size
  const stats = statsLine(listings, figures, locale)
  return [
    t('summary', { count: listings.length, brands }),
    stats ? `${stats}.` : '',
    updated ? t('updated', { date: formatDate(updated, locale) }) : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function topJobs(catalog: Catalog, listings: Listing[], n = 8): JobNode[] {
  const counts = new Map<number, number>()
  for (const l of listings) for (const id of l.jobIds) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => catalog.jobById.get(id))
    .filter((j): j is JobNode => Boolean(j))
    .slice(0, n)
}

function topTypes(catalog: Catalog, listings: Listing[], n = 8): TypeNode[] {
  const counts = new Map<number, number>()
  for (const l of listings) counts.set(l.typeId, (counts.get(l.typeId) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => catalog.typeById.get(id))
    .filter((t): t is TypeNode => Boolean(t))
    .slice(0, n)
}

const leafJobsIn = (catalog: Catalog, listings: Listing[]) => {
  const ids = new Set(listings.flatMap((l) => l.jobIds))
  return catalog.jobs.filter((j) => j.parentId && ids.has(j.id))
}

const leafTypesIn = (catalog: Catalog, listings: Listing[]) => {
  const ids = new Set(listings.map((l) => l.typeId))
  return catalog.types.filter((t) => t.parentId && ids.has(t.id))
}

function redirectIfMoved(catalog: Catalog, locale: Locale, internalPath: string) {
  const target = catalog.data.redirects[internalPath]
  if (target) permanentRedirect(`/${locale}${target}`)
}

// ── All vehicles ─────────────────────────────────────────────────────────────────────────────

export async function vehiclesIndexMetadata(locale: Locale, filtered: boolean): Promise<Metadata> {
  const catalog = await getCatalog(locale)
  const t = await getTranslations({ locale, namespace: 'meta' })
  const path = pathFor(locale, href.vehicles())
  return buildMetadata({
    locale,
    title: fitTitle(t('vehiclesTitle')),
    description: t('vehiclesDescription', { count: catalog.listings.length, brands: catalog.activeBrands.length }),
    path,
    alternates: await alternates((c, l) => pathFor(l, href.vehicles())),
    noindex: filtered,
  })
}

export async function VehiclesIndexView({ locale, searchParams }: { locale: Locale; searchParams?: SearchParams }) {
  const catalog = await getCatalog(locale)
  const t = await getTranslations('hub')
  const tNav = await getTranslations('nav')
  const state: FilterState = searchParams ? parseFilters(searchParams, catalog) : emptyFilters()

  // docs/03 §1: exactly one type or job facet (and nothing else) redirects to that hub.
  if (searchParams) {
    const onlyType = state.types.length === 1 && state.jobs.length === 0
    const onlyJob = state.jobs.length === 1 && state.types.length === 0
    const rest = { ...state, types: [], jobs: [] }
    if ((onlyType || onlyJob) && !hasFacetParams(rest)) {
      if (onlyType) permanentRedirect(pathFor(locale, href.type(catalog.typeBySlug.get(state.types[0])!, locale)))
      permanentRedirect(pathFor(locale, href.job(catalog.jobBySlug.get(state.jobs[0])!)))
    }
  }

  const basePath = pathFor(locale, href.vehicles())
  const listings = catalog.listings
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('allVehicles'), path: basePath },
  ]
  return (
    <div className="container-page">
      <HubHeader
        crumbs={crumbs}
        title={t('allVehicles')}
        lead={t('allVehiclesLead', { count: listings.length, brands: catalog.activeBrands.length })}
      >
        <TaxonomyChips
          label={tNav('browseByType')}
          items={catalog.groups
            .map((g) => ({ key: g.id, name: g.name, count: catalog.countForType(g), href: href.type(g, locale) }))
            .filter((i) => i.count > 0)}
        />
      </HubHeader>
      <BrowseView
        catalog={catalog}
        scope={listings}
        state={state}
        basePath={basePath}
        typeOptions={catalog.groups}
        jobOptions={catalog.areas}
        headingId="hub-title"
      />
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: t('allVehicles'),
            description: t('allVehiclesLead', { count: listings.length, brands: catalog.activeBrands.length }),
            path: basePath,
            locale,
            items: listings.slice(0, 100).map((l) => ({ url: pathFor(locale, href.vehicle(l.slug)), name: l.title })),
            dateModified: catalog.latestUpdate(),
          }),
        ]}
      />
    </div>
  )
}

// ── Vehicle type hubs (incl. curated type × job pages) ───────────────────────────────────────

function resolveType(catalog: Catalog, locale: Locale, segments: string[]) {
  const resolved = catalog.resolveTypePath(segments, COMBO_SEGMENT[locale])
  if (!resolved) return null
  const { type, job } = resolved
  const landing = job ? catalog.landingFor(type, job) : null
  if (job && !landing) return null // only curated combinations have pages
  const scope = job ? catalog.listingsForJob(job, catalog.listingsForType(type)) : catalog.listingsForType(type)
  return { type, job, landing, scope }
}

export async function typeHubMetadata(locale: Locale, segments: string[], filtered: boolean): Promise<Metadata> {
  const catalog = await getCatalog(locale)
  const r = resolveType(catalog, locale, segments)
  if (!r) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const name = lcFirst(r.type.name, locale)
  const path = pathFor(locale, href.type(r.type, locale, r.job))
  const brands = new Set(r.scope.map((l) => l.brandId)).size
  const stats = statsLine(r.scope, catalog.keyFigureSpecs(r.type), locale)
  const seo = r.landing?.seo ?? r.type.seo
  const title = seo.title
    ? fitTitle(seo.title)
    : r.job
      ? fitTitleCandidates([r.landing?.title ?? t('comboTitle', { type: name, job: lcFirst(r.job.name, locale) })])
      : fitTitleCandidates([t('typeTitle', { name }), t('typeTitleShort', { name })])
  const description =
    seo.description ||
    (r.job
      ? `${r.landing?.title ?? t('comboTitle', { type: name, job: lcFirst(r.job.name, locale) })}: ${t('typeDescription', { count: r.scope.length, name, brands, stats })}`
      : t('typeDescription', { count: r.scope.length, name, brands, stats }))
  const minimum = r.job ? MIN_LISTINGS_TO_INDEX_COMBO : MIN_LISTINGS_TO_INDEX_HUB
  return buildMetadata({
    locale,
    title,
    description,
    path,
    alternates: await alternates((c, l) => {
      const type = c.typeById.get(r.type.id)
      const job = r.job ? c.jobById.get(r.job.id) : null
      if (!type || (r.job && !job)) return null
      return pathFor(l, href.type(type, l, job))
    }),
    noindex: filtered || r.scope.length < minimum || Boolean(seo.noindex),
  })
}

export async function TypeHubView({ locale, segments, searchParams }: { locale: Locale; segments: string[]; searchParams?: SearchParams }) {
  const catalog = await getCatalog(locale)
  const r = resolveType(catalog, locale, segments)
  if (!r) {
    redirectIfMoved(catalog, locale, `/types/${segments.join('/')}`)
    notFound()
  }
  if (!r.scope.length) notFound()
  const { type, job, landing, scope } = r
  const t = await getTranslations('hub')
  const tNav = await getTranslations('nav')
  const state = searchParams ? parseFilters(searchParams, catalog) : emptyFilters()
  const group = catalog.groupOf(type)
  const isGroup = group.id === type.id
  const name = lcFirst(type.name, locale)
  const title = job ? (landing?.title ?? t('comboTitle', { type: name, job: lcFirst(job.name, locale) })) : t('typeTitle', { name })
  const basePath = pathFor(locale, href.type(type, locale, job))

  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('types'), path: pathFor(locale, href.types()) },
    ...(isGroup ? [] : [{ name: group.name, path: pathFor(locale, href.type(group, locale)) }]),
    { name: type.name, path: pathFor(locale, href.type(type, locale)) },
    ...(job ? [{ name: job.name, path: basePath }] : []),
  ]

  const siblings = isGroup ? catalog.typesInGroup(type) : catalog.typesInGroup(group)
  const chips = job
    ? []
    : siblings
        .map((s) => ({ key: s.id, name: s.name, count: catalog.countForType(s), href: href.type(s, locale), current: s.id === type.id }))
        .filter((c) => c.count > 0)
  const figures = catalog.keyFigureSpecs(type)
  const jobs = topJobs(catalog, scope)
  const combos = catalog.data.landings
    .filter((l) => l.typeId === type.id && l.hasLocale && (!job || l.jobId !== job.id))
    .map((l) => ({ landing: l, job: catalog.jobById.get(l.jobId) }))
    .filter((x): x is { landing: typeof x.landing; job: JobNode } => Boolean(x.job))
  const spotlight = catalog.spotlight({ type, job: job ?? undefined })
  const intro = job ? landing?.intro ?? null : type.intro
  const faqs = job ? (landing?.faqs ?? []) : type.faqs

  return (
    <div className="container-page">
      <HubHeader
        crumbs={crumbs}
        title={title}
        lead={job ? null : type.shortDescription}
        summary={summary(t, scope, figures, locale, catalog.latestUpdate(scope))}
      >
        <TaxonomyChips label={t('subtypesNav')} items={chips} />
      </HubHeader>

      <BrowseView
        catalog={catalog}
        scope={scope}
        state={state}
        basePath={basePath}
        typeOptions={isGroup && !job ? catalog.typesInGroup(type) : null}
        jobOptions={leafJobsIn(catalog, scope)}
        featured={catalog.featuredListings({ type, job: job ?? undefined })}
        headingId="hub-title"
      />

      {spotlight && <Spotlight brand={spotlight} modelCount={catalog.listingsForBrand(spotlight).length} />}

      <HubTable catalog={catalog} listings={scope} figures={figures} title={t('tableTitle', { name: title })} showType={isGroup} />

      <HubContent
        locale={locale}
        aboutTitle={title}
        intro={intro}
        faqs={faqs}
        related={[
          { title: t('relatedJobs'), items: jobs.map((j) => ({ key: j.id, name: j.name, href: href.job(j) })) },
          {
            title: t('comboPages'),
            items: combos.map((c) => ({
              key: c.landing.id,
              name: c.landing.title ?? t('comboTitle', { type: name, job: lcFirst(c.job.name, locale) }),
              href: href.type(type, locale, c.job),
            })),
          },
          ...(job ? [{ title: tNav('types'), items: [{ key: type.id, name: t('moreTypes', { name: type.name }), href: href.type(type, locale) }] }] : []),
        ]}
      />

      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: title,
            description: type.shortDescription ?? title,
            path: basePath,
            locale,
            items: scope.map((l) => ({ url: pathFor(locale, href.vehicle(l.slug)), name: l.title })),
            dateModified: catalog.latestUpdate(scope),
          }),
          faqLd(faqs),
        ]}
      />
    </div>
  )
}

// ── Job hubs ─────────────────────────────────────────────────────────────────────────────────

export async function jobHubMetadata(locale: Locale, segments: string[], filtered: boolean): Promise<Metadata> {
  const catalog = await getCatalog(locale)
  const job = catalog.resolveJobPath(segments)
  if (!job) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const scope = catalog.listingsForJob(job)
  const name = lcFirst(job.name, locale)
  const path = pathFor(locale, href.job(job))
  return buildMetadata({
    locale,
    title: job.seo.title ? fitTitle(job.seo.title) : fitTitle(t('jobTitle', { name })),
    description:
      job.seo.description || t('jobDescription', { count: scope.length, name, brands: new Set(scope.map((l) => l.brandId)).size }),
    path,
    alternates: await alternates((c, l) => {
      const j = c.jobById.get(job.id)
      return j ? pathFor(l, href.job(j)) : null
    }),
    noindex: filtered || scope.length < MIN_LISTINGS_TO_INDEX_HUB || Boolean(job.seo.noindex),
  })
}

export async function JobHubView({ locale, segments, searchParams }: { locale: Locale; segments: string[]; searchParams?: SearchParams }) {
  const catalog = await getCatalog(locale)
  const job = catalog.resolveJobPath(segments)
  if (!job) {
    redirectIfMoved(catalog, locale, `/jobs/${segments.join('/')}`)
    notFound()
  }
  const scope = catalog.listingsForJob(job)
  if (!scope.length) notFound()
  const t = await getTranslations('hub')
  const tNav = await getTranslations('nav')
  const state = searchParams ? parseFilters(searchParams, catalog) : emptyFilters()
  const area = catalog.parentOf(job) ?? job
  const isArea = area.id === job.id
  const title = t('jobTitle', { name: lcFirst(job.name, locale) })
  const basePath = pathFor(locale, href.job(job))

  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('jobs'), path: pathFor(locale, href.jobs()) },
    ...(isArea ? [] : [{ name: area.name, path: pathFor(locale, href.job(area)) }]),
    { name: job.name, path: basePath },
  ]
  const siblings = catalog.childrenOf(area)
  const chips = siblings
    .map((s) => ({ key: s.id, name: s.name, count: catalog.countForJob(s), href: href.job(s), current: s.id === job.id }))
    .filter((c) => c.count > 0)

  // Key figures: the group of the most common type in this hub.
  const types = topTypes(catalog, scope)
  const figures = types[0] ? catalog.keyFigureSpecs(types[0]) : []
  const typical = job.typicalTypeIds.map((id) => catalog.typeById.get(id)).filter((x): x is TypeNode => Boolean(x))
  const relatedTypes = [...new Map([...typical, ...types].map((t2) => [t2.id, t2])).values()].filter((t2) => catalog.countForType(t2) > 0)
  const combos = catalog.data.landings
    .filter((l) => l.jobId === job.id && l.hasLocale)
    .map((l) => ({ landing: l, type: catalog.typeById.get(l.typeId) }))
    .filter((x): x is { landing: typeof x.landing; type: TypeNode } => Boolean(x.type))
  const spotlight = catalog.spotlight({ job })

  return (
    <div className="container-page">
      <HubHeader crumbs={crumbs} title={title} lead={job.shortDescription} summary={summary(t, scope, figures, locale, catalog.latestUpdate(scope))}>
        <TaxonomyChips label={t('jobsNav')} items={chips} />
      </HubHeader>

      <BrowseView
        catalog={catalog}
        scope={scope}
        state={state}
        basePath={basePath}
        typeOptions={leafTypesIn(catalog, scope)}
        jobOptions={isArea ? catalog.childrenOf(job) : null}
        featured={catalog.featuredListings({ job })}
        headingId="hub-title"
      />

      {spotlight && <Spotlight brand={spotlight} modelCount={catalog.listingsForBrand(spotlight).length} />}

      <HubTable catalog={catalog} listings={scope} figures={figures} title={t('tableTitle', { name: title })} showType />

      <HubContent
        locale={locale}
        aboutTitle={title}
        intro={job.intro}
        faqs={job.faqs}
        related={[
          { title: t('relatedTypes'), items: relatedTypes.map((x) => ({ key: x.id, name: x.name, href: href.type(x, locale) })) },
          {
            title: t('comboPages'),
            items: combos.map((c) => ({
              key: c.landing.id,
              name: c.landing.title ?? t('comboTitle', { type: lcFirst(c.type.name, locale), job: lcFirst(job.name, locale) }),
              href: href.type(c.type, locale, job),
            })),
          },
        ]}
      />

      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: title,
            description: job.shortDescription ?? title,
            path: basePath,
            locale,
            items: scope.map((l) => ({ url: pathFor(locale, href.vehicle(l.slug)), name: l.title })),
            dateModified: catalog.latestUpdate(scope),
          }),
          faqLd(job.faqs),
        ]}
      />
    </div>
  )
}
