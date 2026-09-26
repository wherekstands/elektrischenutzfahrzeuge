import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { specParts } from '@/lib/catalog/format'
import { absolute } from '@/lib/urls'
import { renderOgImage } from '@/lib/seo/og'

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const catalog = await getCatalog(locale)
  const listing = catalog.listingBySlug.get(slug)
  const t = await getTranslations({ locale, namespace: 'specs' })
  const tLabels = await getTranslations({ locale, namespace: 'labels' })
  if (!listing) return renderOgImage({ eyebrow: '', title: 'ECV Base' })
  const labels = { yes: t('yes'), no: t('no'), std: t('std'), opt: t('opt'), notAvailable: t('notAvailable') }
  const type = catalog.typeOf(listing)
  const figures = catalog
    .keyFigureSpecs(listing)
    .map((s) => ({ s, p: specParts(s, listing.specs[s.key], locale, labels) }))
    .filter((x) => x.p)
    .slice(0, 3)
    .map(({ s, p }) => ({ label: s.shortLabel, value: p!.value, unit: p!.unit }))
  const photo = listing.images[0]?.sizes.card?.url ?? listing.images[0]?.url
  return renderOgImage({
    eyebrow: catalog.brandOf(listing).name,
    title: listing.model,
    subtitle: type.name,
    figures,
    illustration: type.illustration,
    photoUrl: photo ? absolute(photo) : null,
    badge: catalog.isVerified(listing) ? tLabels('confirmedBy', { brand: catalog.brandOf(listing).name }) : null,
  })
}
