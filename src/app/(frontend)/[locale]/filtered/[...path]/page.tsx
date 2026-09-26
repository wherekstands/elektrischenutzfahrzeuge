import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import {
  JobHubView,
  jobHubMetadata,
  type SearchParams,
  TypeHubView,
  typeHubMetadata,
  VehiclesIndexView,
  vehiclesIndexMetadata,
} from '@/views/hubs'

/**
 * Faceted hub URLs (…?range_min=300&brand=ford). src/proxy.ts rewrites hub requests that carry filter
 * parameters here; direct requests to /filtered are blocked. Rendered per request, noindex,follow, with
 * the canonical pointing at the unfiltered hub (docs/03 §1).
 */
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; path: string[] }>; searchParams: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, path } = await params
  const [section, ...rest] = path
  if (section === 'vehicles' && rest.length === 0) return vehiclesIndexMetadata(locale as Locale, true)
  if (section === 'types') return typeHubMetadata(locale as Locale, rest, true)
  if (section === 'jobs') return jobHubMetadata(locale as Locale, rest, true)
  return {}
}

export default async function Page({ params, searchParams }: Props) {
  const { locale, path } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const [section, ...rest] = path
  if (section === 'vehicles' && rest.length === 0) return <VehiclesIndexView locale={locale as Locale} searchParams={sp} />
  if (section === 'types' && rest.length) return <TypeHubView locale={locale as Locale} segments={rest} searchParams={sp} />
  if (section === 'jobs' && rest.length) return <JobHubView locale={locale as Locale} segments={rest} searchParams={sp} />
  notFound()
}
