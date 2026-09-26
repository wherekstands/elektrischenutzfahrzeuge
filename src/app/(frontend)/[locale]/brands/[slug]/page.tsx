import { ExternalLink, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { HubHeader } from '@/components/hub/HubHeader'
import { HubTable } from '@/components/hub/HubTable'
import { DemoBadge } from '@/components/ui/Badges'
import { JsonLd } from '@/components/ui/JsonLd'
import { MailtoButton } from '@/components/vehicle/ContactLinks'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import type { TypeNode } from '@/lib/catalog/types'
import { breadcrumbLd, collectionPageLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitleCandidates } from '@/lib/seo/metadata'
import { absolute, href, pathFor } from '@/lib/urls'
import { alternates } from '@/views/shared'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const catalog = await getCatalog(params.locale as Locale)
  return catalog.activeBrands.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const catalog = await getCatalog(locale)
  const brand = catalog.brandBySlug.get(slug)
  if (!brand) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const count = catalog.listingsForBrand(brand).length
  return buildMetadata({
    locale,
    title: fitTitleCandidates([t('brandTitle', { brand: brand.name }), brand.name]),
    description: t('brandDescription', { brand: brand.name, count }),
    path: pathFor(locale, href.brand(slug)),
    alternates: await alternates((c, l) => (c.brandById.has(brand.id) ? pathFor(l, href.brand(slug)) : null)),
    noindex: count === 0,
    images: [{ url: absolute(`/og/${locale}/brands/${slug}`), width: 1200, height: 630, alt: brand.name }],
  })
}

export default async function BrandPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const brand = catalog.brandBySlug.get(slug)
  if (!brand) {
    const target = catalog.data.redirects[`/brands/${slug}`]
    if (target) permanentRedirect(`/${locale}${target}`)
    notFound()
  }
  const listings = catalog.listingsForBrand(brand)
  if (!listings.length) notFound()
  const t = await getTranslations('brands')
  const tNav = await getTranslations('nav')
  const tV = await getTranslations('vehicle')
  const path = pathFor(locale, href.brand(slug))

  const byType = new Map<number, typeof listings>()
  for (const l of listings) byType.set(l.typeId, [...(byType.get(l.typeId) ?? []), l])
  const types = [...byType.keys()]
    .map((id) => catalog.typeById.get(id))
    .filter((x): x is TypeNode => Boolean(x))
    .sort((a, b) => catalog.groupOf(a).order - catalog.groupOf(b).order || a.order - b.order)
  const featured = catalog.featuredListings({ brand })
  const figures = types[0] ? catalog.keyFigureSpecs(types[0]) : []
  const contactListing = listings.find((l) => catalog.showContact(l))

  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('brands'), path: pathFor(locale, href.brands()) },
    { name: brand.name, path },
  ]

  return (
    <div className="container-page">
      <HubHeader
        crumbs={crumbs}
        title={t('brandTitle', { brand: brand.name })}
        lead={brand.description}
        summary={t('brandLead', { count: listings.length, brand: brand.name, types: types.length })}
      >
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-muted">
          {brand.country && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} aria-hidden />
              {brand.country}
            </span>
          )}
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5">
              <ExternalLink size={14} aria-hidden />
              {t('visitWebsite')}
            </a>
          )}
          {brand.demo && <DemoBadge />}
        </div>
        {contactListing && brand.contact && (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-4">
            <div>
              <p className="font-semibold">{brand.contact.name ?? brand.name}</p>
              <p className="text-[13px] text-muted">{[brand.contact.role, brand.contact.region].filter(Boolean).join(' · ')}</p>
            </div>
            <MailtoButton brand={brand} listing={contactListing} url={absolute(path)} label={t('contact', { brand: brand.name })} className="btn-sm" />
            <span className="text-[12px] text-muted">{tV('sponsoredContact')}</span>
          </div>
        )}
      </HubHeader>

      {featured.length > 0 && (
        <div className="results-grid mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <VehicleCard key={l.id} listing={l} catalog={catalog} featured />
          ))}
        </div>
      )}

      <div className="space-y-12">
        {types.map((type) => (
          <section key={type.id} aria-labelledby={`t-${type.id}`}>
            <h2 id={`t-${type.id}`} className="text-[20px] font-bold">
              <Link href={href.type(type, locale)} className="hover:text-accent">
                {type.name}
              </Link>
            </h2>
            <div className="results-grid mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {byType.get(type.id)!.map((l) => (
                <VehicleCard key={l.id} listing={l} catalog={catalog} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <HubTable catalog={catalog} listings={listings} figures={figures} title={t('allModels')} showType />

      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          {
            ...collectionPageLd({
              name: t('brandTitle', { brand: brand.name }),
              description: brand.description ?? t('brandLead', { count: listings.length, brand: brand.name, types: types.length }),
              path,
              locale,
              items: listings.map((l) => ({ url: pathFor(locale, href.vehicle(l.slug)), name: l.title })),
              dateModified: catalog.latestUpdate(listings),
            }),
            about: { '@type': 'Brand', name: brand.name, ...(brand.website ? { url: brand.website } : {}) },
          },
        ]}
      />
    </div>
  )
}
