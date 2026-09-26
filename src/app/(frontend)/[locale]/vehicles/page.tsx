import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { VehiclesIndexView, vehiclesIndexMetadata } from '@/views/hubs'

type Props = { params: Promise<{ locale: string }> }

/** Static; the same URL with filter parameters is served by ../filtered (see src/proxy.ts). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return vehiclesIndexMetadata(locale as Locale, false)
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <VehiclesIndexView locale={locale as Locale} />
}
