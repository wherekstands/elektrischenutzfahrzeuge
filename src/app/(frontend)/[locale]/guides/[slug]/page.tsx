import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Spotlight } from '@/components/hub/Spotlight'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Faqs } from '@/components/ui/Faqs'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import { PUBLIC_LOCALES, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { formatDate } from '@/lib/catalog/format'
import type { JobNode, Listing, TypeNode } from '@/lib/catalog/types'
import { getGuide, getGuides } from '@/lib/content'
import { SITE_NAME } from '@/lib/env'
import { articleLd, breadcrumbLd, faqLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return (await getGuides(params.locale as Locale)).map((g) => ({ slug: g.slug }))
}

/** hreflang: the same guide (by id) in every published locale where it exists. */
async function guideAlternates(id: number) {
  const out: Partial<Record<Locale, string>> = {}
  for (const l of PUBLIC_LOCALES) {
    const g = (await getGuides(l)).find((x) => x.id === id)
    if (g) out[l] = pathFor(l, href.guide(g.slug))
  }
  return out
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const guide = await getGuide(locale, slug)
  if (!guide) return {}
  return buildMetadata({
    locale,
    title: fitTitle(guide.title),
    description: guide.excerpt,
    path: pathFor(locale, href.guide(slug)),
    alternates: await guideAlternates(guide.id),
    ogType: 'article',
    publishedTime: guide.publishedAt ?? undefined,
    modifiedTime: guide.updatedAt,
    ...(guide.image ? { images: [{ url: guide.image.url, width: guide.image.width, height: guide.image.height, alt: guide.image.alt }] } : {}),
  })
}

export default async function GuidePage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  setRequestLocale(locale)
  const [guide, catalog] = await Promise.all([getGuide(locale, slug), getCatalog(locale)])
  if (!guide) {
    const target = catalog.data.redirects[`/guides/${slug}`]
    if (target) permanentRedirect(`/${locale}${target}`)
    notFound()
  }
  const t = await getTranslations('guides')
  const tNav = await getTranslations('nav')
  const tHub = await getTranslations('hub')
  const path = pathFor(locale, href.guide(slug))
  const author = guide.author.name || catalog.data.settings.owner.name || SITE_NAME
  const types = guide.relatedTypeIds.map((id) => catalog.typeById.get(id)).filter((x): x is TypeNode => Boolean(x))
  const jobs = guide.relatedJobIds.map((id) => catalog.jobById.get(id)).filter((x): x is JobNode => Boolean(x))
  const listings = guide.relatedListingIds.map((id) => catalog.listingById.get(id)).filter((x): x is Listing => Boolean(x))
  const spotlight = catalog.spotlight({ guides: true })
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('guides'), path: pathFor(locale, href.guides()) },
    { name: guide.title, path },
  ]

  return (
    <div className="container-page pt-6">
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 max-w-3xl">
          <h1 className="text-[clamp(30px,4.2vw,46px)] font-extrabold">{guide.title}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-ink-2">{guide.excerpt}</p>
          <p className="mt-4 text-[13.5px] text-muted">
            {t('by', { author })}
            {guide.author.role ? `, ${guide.author.role}` : ''} · {t('published', { date: formatDate(guide.publishedAt ?? guide.updatedAt, locale) })} ·{' '}
            {t('updated', { date: formatDate(guide.updatedAt, locale) })}
          </p>
          <RichText value={guide.content} locale={locale} className="mt-8" />
          <Faqs title={tHub('faqTitle')} faqs={guide.faqs} />
        </article>
        <aside className="space-y-8">
          {types.length > 0 && (
            <nav aria-label={t('relatedHubs')}>
              <p className="eyebrow mb-3">{tNav('types')}</p>
              <ul className="space-y-2 text-[14.5px]">
                {types.map((x) => (
                  <li key={x.id}>
                    <Link href={href.type(x, locale)} className="link">
                      {x.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {jobs.length > 0 && (
            <nav aria-label={tNav('jobs')}>
              <p className="eyebrow mb-3">{tNav('jobs')}</p>
              <ul className="space-y-2 text-[14.5px]">
                {jobs.map((x) => (
                  <li key={x.id}>
                    <Link href={href.job(x)} className="link">
                      {x.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
      {spotlight && <Spotlight brand={spotlight} modelCount={catalog.listingsForBrand(spotlight).length} />}
      {listings.length > 0 && (
        <section aria-labelledby="related-vehicles" className="mt-14">
          <h2 id="related-vehicles" className="text-[22px] font-bold">
            {t('related')}
          </h2>
          <div className="results-grid mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <VehicleCard key={l.id} listing={l} catalog={catalog} />
            ))}
          </div>
        </section>
      )}
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          articleLd({
            title: guide.title,
            description: guide.excerpt,
            path,
            locale,
            author,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            image: guide.image?.url,
          }),
          faqLd(guide.faqs),
        ]}
      />
    </div>
  )
}
