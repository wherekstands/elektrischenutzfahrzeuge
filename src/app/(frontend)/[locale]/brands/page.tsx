import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { HubHeader } from '@/components/hub/HubHeader'
import { JsonLd } from '@/components/ui/JsonLd'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { breadcrumbLd, collectionPageLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { alternates } from '@/views/shared'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const catalog = await getCatalog(locale)
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tB = await getTranslations({ locale, namespace: 'brands' })
  return buildMetadata({
    locale,
    title: fitTitle(t('brandsTitle')),
    description: tB('lead', { count: catalog.activeBrands.length }),
    path: pathFor(locale, href.brands()),
    alternates: await alternates((_c, l) => pathFor(l, href.brands())),
  })
}

export default async function BrandsIndex({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const t = await getTranslations('brands')
  const tNav = await getTranslations('nav')
  const brands = catalog.activeBrands
  const byLetter = new Map<string, typeof brands>()
  for (const b of brands) {
    const letter = b.name[0].toUpperCase()
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), b])
  }
  const path = pathFor(locale, href.brands())
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('brands'), path },
  ]
  return (
    <div className="container-page">
      <HubHeader crumbs={crumbs} title={t('title')} lead={t('lead', { count: brands.length })} />
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        {[...byLetter.entries()].map(([letter, list]) => (
          <section key={letter} aria-label={letter} className="mb-6 break-inside-avoid">
            <h2 className="mb-2 font-display text-[22px] font-bold text-faint">{letter}</h2>
            <ul className="divide-y divide-line rounded-card border border-line bg-surface">
              {list.map((b) => {
                const listings = catalog.listingsForBrand(b)
                const groups = [...new Set(listings.map((l) => catalog.groupOf(catalog.typeOf(l)).name))]
                return (
                  <li key={b.id}>
                    <Link href={href.brand(b.slug)} className="group flex items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block font-semibold group-hover:text-accent">{b.name}</span>
                        <span className="block truncate text-[12.5px] text-muted">
                          {[b.country, groups.slice(0, 2).join(', ')].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="num shrink-0 text-[13px] text-muted">{t('models', { count: listings.length })}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: t('title'),
            description: t('lead', { count: brands.length }),
            path,
            locale,
            items: brands.map((b) => ({ url: pathFor(locale, href.brand(b.slug)), name: b.name })),
          }),
        ]}
      />
    </div>
  )
}
