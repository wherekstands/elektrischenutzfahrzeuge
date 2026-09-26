import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { renderOgImage } from '@/lib/seo/og'

/** Default OG image for every page without its own. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: Locale }
  const catalog = await getCatalog(locale)
  const t = await getTranslations({ locale, namespace: 'home' })
  const tSite = await getTranslations({ locale, namespace: 'site' })
  return renderOgImage({
    eyebrow: tSite('tagline'),
    title: t('title'),
    subtitle: t('stats', {
      listings: catalog.listings.length,
      brands: catalog.activeBrands.length,
      types: catalog.types.filter((x) => x.parentId && catalog.countForType(x) > 0).length,
      jobs: catalog.jobs.filter((x) => x.parentId && catalog.countForJob(x) > 0).length,
    }),
    illustration: 'truck',
  })
}
