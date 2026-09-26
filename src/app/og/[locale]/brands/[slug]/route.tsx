import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { renderOgImage } from '@/lib/seo/og'

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const catalog = await getCatalog(locale)
  const brand = catalog.brandBySlug.get(slug)
  const t = await getTranslations({ locale, namespace: 'home' })
  if (!brand) return renderOgImage({ eyebrow: '', title: 'ECV Base' })
  const listings = catalog.listingsForBrand(brand)
  const types = [...new Set(listings.map((l) => catalog.typeOf(l).name))]
  const first = listings[0] ? catalog.typeOf(listings[0]) : null
  return renderOgImage({
    eyebrow: t('models', { count: listings.length }),
    title: brand.name,
    subtitle: types.slice(0, 3).join(' · '),
    illustration: first?.illustration ?? 'van',
  })
}
