import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { COMBO_SEGMENT, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { TypeHubView, typeHubMetadata } from '@/views/hubs'

type Props = { params: Promise<{ locale: string; slug: string[] }> }

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale
  const catalog = await getCatalog(locale)
  const hubs = catalog.types.filter((t) => catalog.countForType(t) > 0).map((t) => ({ slug: t.path }))
  const combos = catalog.data.landings
    .filter((l) => l.hasLocale)
    .map((l) => {
      const type = catalog.typeById.get(l.typeId)
      const job = catalog.jobById.get(l.jobId)
      return type && job ? { slug: [...type.path, COMBO_SEGMENT[locale], job.slug] } : null
    })
    .filter((x): x is { slug: string[] } => Boolean(x))
  return [...hubs, ...combos]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  return typeHubMetadata(locale as Locale, slug, false)
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <TypeHubView locale={locale as Locale} segments={slug} />
}
