/** OG image for type hubs (a catch-all segment cannot hold an opengraph-image file). */
import { getTranslations } from 'next-intl/server'

import { COMBO_SEGMENT, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { formatRange } from '@/lib/catalog/format'
import { renderOgImage } from '@/lib/seo/og'

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string[] }
  const catalog = await getCatalog(locale)
  const resolved = catalog.resolveTypePath(slug, COMBO_SEGMENT[locale])
  const t = await getTranslations({ locale, namespace: 'home' })
  if (!resolved) return renderOgImage({ eyebrow: '', title: 'ECV Base' })
  const { type, job } = resolved
  const scope = job ? catalog.listingsForJob(job, catalog.listingsForType(type)) : catalog.listingsForType(type)
  const figures = catalog
    .keyFigureSpecs(type)
    .map((s) => {
      const values = scope.map((l) => l.specs[s.key]).filter((v): v is number => typeof v === 'number')
      const range = formatRange(values, s, locale)
      return range ? { label: s.shortLabel, value: range.replace(/\s\S+$/, ''), unit: s.unit ?? undefined } : null
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .slice(0, 2)
  return renderOgImage({
    eyebrow: t('models', { count: scope.length }),
    title: job ? `${type.name} · ${job.name}` : type.name,
    subtitle: type.shortDescription,
    figures,
    illustration: type.illustration,
  })
}
