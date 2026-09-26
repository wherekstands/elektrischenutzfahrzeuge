import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { VehicleView, vehicleMetadata } from '@/views/vehicle'

type Props = { params: Promise<{ locale: string; slug: string }> }

/** Pre-rendered at build; new listings render on first request and are cached (revalidated on publish). */
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const catalog = await getCatalog(params.locale as Locale)
  return catalog.listings.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  return vehicleMetadata(locale as Locale, slug)
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <VehicleView locale={locale as Locale} slug={slug} />
}
