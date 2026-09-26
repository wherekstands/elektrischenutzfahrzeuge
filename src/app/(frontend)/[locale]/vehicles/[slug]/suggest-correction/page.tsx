import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CorrectionForm } from '@/components/correction/CorrectionForm'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { formatSpec } from '@/lib/catalog/format'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { valueLabels } from '@/views/vehicle'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const catalog = await getCatalog(locale)
  const listing = catalog.listingBySlug.get(slug)
  if (!listing) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tC = await getTranslations({ locale, namespace: 'correction' })
  return buildMetadata({
    locale,
    title: fitTitle(t('correctionTitle', { title: listing.title })),
    description: tC('lead', { title: listing.title }),
    path: pathFor(locale, href.correction(slug)),
    noindex: true,
  })
}

export default async function CorrectionPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const listing = catalog.listingBySlug.get(slug)
  if (!listing) notFound()
  const t = await getTranslations('correction')
  const tNav = await getTranslations('nav')
  const tVehicle = await getTranslations('vehicle')
  const labels = await valueLabels(locale)
  const vehiclePath = pathFor(locale, href.vehicle(slug))
  const fields = [
    { value: 'summary', label: tVehicle('overview'), current: listing.summary },
    ...catalog.profileSpecs(listing).map((s) => ({
      value: s.key,
      label: s.label,
      current: formatSpec(s, listing.specs[s.key], locale, labels) ?? '',
    })),
  ]
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: listing.title, path: vehiclePath },
    { name: t('title'), path: pathFor(locale, href.correction(slug)) },
  ]
  return (
    <div className="container-page pt-6">
      <Breadcrumbs items={crumbs} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="text-[clamp(28px,4vw,38px)] font-extrabold">{t('title')}</h1>
        <p className="mt-3 text-ink-2">{t('lead', { title: listing.title })}</p>
        <div className="mt-8">
          <CorrectionForm
            slug={slug}
            locale={locale}
            fields={fields}
            backHref={vehiclePath}
            privacyHref={pathFor(locale, href.privacy())}
          />
        </div>
      </div>
    </div>
  )
}
