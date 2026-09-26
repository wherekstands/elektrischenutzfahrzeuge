import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { JobHubView, jobHubMetadata } from '@/views/hubs'

type Props = { params: Promise<{ locale: string; slug: string[] }> }

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const catalog = await getCatalog(params.locale as Locale)
  return catalog.jobs.filter((j) => catalog.countForJob(j) > 0).map((j) => ({ slug: j.path }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  return jobHubMetadata(locale as Locale, slug, false)
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  return <JobHubView locale={locale as Locale} segments={slug} />
}
