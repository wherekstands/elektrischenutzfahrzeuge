import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { JsonLd } from '@/components/ui/JsonLd'
import { ChargingSection } from '@/components/vehicle/ChargingSection'
import { ContactSection } from '@/components/vehicle/ContactSection'
import { DocumentsSection } from '@/components/vehicle/DocumentsSection'
import { Gallery } from '@/components/vehicle/Gallery'
import { Highlights } from '@/components/vehicle/Highlights'
import { PreviewBanner } from '@/components/vehicle/PreviewBanner'
import { SectionNav } from '@/components/vehicle/SectionNav'
import { SourcesBox } from '@/components/vehicle/SourcesBox'
import { SpecSheet } from '@/components/vehicle/SpecSheet'
import { SummaryPanel } from '@/components/vehicle/SummaryPanel'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatSpec, type ValueLabels } from '@/lib/catalog/format'
import { similarListings } from '@/lib/catalog/rank'
import { factSentences } from '@/lib/catalog/sentences'
import type { Listing } from '@/lib/catalog/types'
import { breadcrumbLd, vehicleLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle, fitTitleCandidates, truncate } from '@/lib/seo/metadata'
import { absolute, href, pathFor } from '@/lib/urls'

import { alternates, lcFirst } from './shared'

export async function valueLabels(locale: Locale): Promise<ValueLabels> {
  const t = await getTranslations({ locale, namespace: 'specs' })
  return { yes: t('yes'), no: t('no'), std: t('std'), opt: t('opt'), notAvailable: t('notAvailable') }
}

const markdownPath = (locale: Locale, slug: string) => `${pathFor(locale, href.vehicle(slug))}.md`

/** Title parts per key figure (docs/03 §3: "{Brand} {Model}: range, battery, payload & price"). */
const TITLE_PART: Record<string, string> = {
  range_km: 'partRange',
  battery_kwh: 'partBattery',
  payload_kg: 'partPayload',
  runtime_h: 'partRuntime',
  op_weight_kg: 'partWeight',
  passengers: 'partPassengers',
}

function joinParts(parts: string[], and: string) {
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} ${and} ${parts[parts.length - 1]}`
}

export async function vehicleTitleAndDescription(listing: Listing, catalog: Catalog, locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const labels = await valueLabels(locale)
  const figures = catalog.keyFigureSpecs(listing)
  const withValue = figures.filter((f) => listing.specs[f.key] != null)
  const parts = withValue.map((f) => TITLE_PART[f.key]).filter(Boolean).map((k) => t(k))
  if (catalog.hasPrice(listing)) parts.push(t('partPrice'))
  const candidates: string[] = []
  for (let n = parts.length; n >= 1; n--) {
    candidates.push(t('vehicleTitle', { title: listing.title, parts: joinParts(parts.slice(0, n), '&') }))
  }
  candidates.push(listing.title)
  const title = listing.seo.title ? fitTitle(listing.seo.title) : fitTitleCandidates(candidates)

  const figureText = withValue
    .map((f) => {
      const v = formatSpec(f, listing.specs[f.key], locale, labels)
      return v ? `${v} ${lcFirst(f.shortLabel, locale)}` : null
    })
    .filter(Boolean) as string[]
  const description =
    listing.seo.description ||
    (figureText.length
      ? t('vehicleDescription', { figures: figureText.join(', ') })
      : t('vehicleDescriptionShort', { title: listing.title }))
  return { title, description: truncate(description) }
}

async function resolve(locale: Locale, slug: string) {
  const catalog = await getCatalog(locale)
  const listing = catalog.listingBySlug.get(slug)
  return { catalog, listing }
}

export async function vehicleMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const { catalog, listing } = await resolve(locale, slug)
  if (!listing) return {}
  const { title, description } = await vehicleTitleAndDescription(listing, catalog, locale)
  const path = pathFor(locale, href.vehicle(slug))
  const image = listing.images[0]?.sizes.og
  return buildMetadata({
    locale,
    title,
    description,
    path,
    alternates: await alternates((c, l) => (c.listingById.has(listing.id) ? pathFor(l, href.vehicle(slug)) : null)),
    noindex: Boolean(listing.seo.noindex),
    markdownPath: markdownPath(locale, slug),
    modifiedTime: listing.updatedAt,
    ...(image ? { images: [{ url: absolute(image.url), width: image.width, height: image.height, alt: listing.title }] } : {}),
  })
}

export async function VehicleView({ locale, slug }: { locale: Locale; slug: string }) {
  const { catalog, listing } = await resolve(locale, slug)
  if (!listing) {
    const target = catalog.data.redirects[`/vehicles/${slug}`]
    if (target) permanentRedirect(`/${locale}${target}`)
    notFound()
  }
  const t = await getTranslations('vehicle')
  const tNav = await getTranslations('nav')
  const tFacts = await getTranslations('facts')
  const labels = await valueLabels(locale)
  const brand = catalog.brandOf(listing)
  const type = catalog.typeOf(listing)
  const group = catalog.groupOf(type)
  const path = pathFor(locale, href.vehicle(listing.slug))
  const url = absolute(path)
  const jobs = catalog.jobsOf(listing)
  const versions = catalog.versionsOf(listing)
  const similar = similarListings(listing, catalog, 3)
  const sentences = factSentences(listing, catalog, locale, (k, v) => tFacts(k as never, v as never), (k) => tFacts.has(k as never), labels)

  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: group.name, path: pathFor(locale, href.type(group, locale)) },
    ...(group.id !== type.id ? [{ name: type.name, path: pathFor(locale, href.type(type, locale)) }] : []),
    { name: listing.title, path },
  ]

  return (
    <>
      <PreviewBanner path={path} />
      <article className="container-page pb-8 pt-6">
        <Breadcrumbs items={crumbs} />

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <div className="min-w-0">
            <Gallery images={listing.images} illustration={type.illustration} seed={listing.slug} title={listing.title} />
          </div>
          <aside className="lg:row-span-2">
            <div className="lg:sticky lg:top-24">
              <SummaryPanel listing={listing} catalog={catalog} url={url} labels={labels} />
            </div>
          </aside>

          <div className="min-w-0 space-y-12">
            <div id="overview" className="scroll-mt-28 space-y-6">
              <Highlights listing={listing} catalog={catalog} />
              <section aria-labelledby="brief-title">
                <h2 id="brief-title" className="eyebrow">
                  {t('inBrief')}
                </h2>
                <p className="mt-2 max-w-3xl text-[16.5px] leading-relaxed text-ink">
                  {listing.summary}
                </p>
                <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-2">{sentences.join(' ')}</p>
                {jobs.length > 0 && (
                  <div className="mt-5">
                    <h3 className="eyebrow">{t('usedFor')}</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {jobs.map((j) => (
                        <li key={j.id}>
                          <Link href={href.job(j)} className="chip">
                            {j.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>

            <SectionNav />
            <SpecSheet listing={listing} catalog={catalog} labels={labels} />
            <ChargingSection listing={listing} catalog={catalog} labels={labels} />
            <DocumentsSection listing={listing} catalog={catalog} />
            <ContactSection listing={listing} catalog={catalog} url={url} />

            {versions.length > 0 && (
              <section aria-labelledby="versions-title">
                <h2 id="versions-title" className="text-[22px] font-bold">
                  {t('versionsTitle', { family: `${brand.name} ${listing.family}` })}
                </h2>
                <p className="mt-1 text-[14px] text-muted">{t('versionsNote', { count: versions.length })}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {versions.map((v) => (
                    <li key={v.id}>
                      <Link href={href.vehicle(v.slug)} className="chip">
                        {v.model}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <SourcesBox listing={listing} catalog={catalog} markdownPath={markdownPath(locale, listing.slug)} />
          </div>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-title" className="mt-16">
            <h2 id="similar-title" className="text-[22px] font-bold">
              {t('similar')}
            </h2>
            <div className="results-grid mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((l) => (
                <VehicleCard key={l.id} listing={l} catalog={catalog} />
              ))}
            </div>
          </section>
        )}
      </article>
      <JsonLd
        data={[
          ...vehicleLd({
            listing,
            catalog,
            locale,
            path,
            brandPath: pathFor(locale, href.brand(brand.slug)),
            imageUrls: listing.images.length ? listing.images.map((i) => i.sizes.large?.url ?? i.url) : [`${path}/opengraph-image`],
            labels,
            netPriceNote: t('priceNet'),
          }),
          breadcrumbLd(crumbs),
        ]}
      />
    </>
  )
}
