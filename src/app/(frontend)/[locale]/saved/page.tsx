import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { SavedActions, SavedSync } from '@/components/saved/SavedClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import type { Listing } from '@/lib/catalog/types'
import { MAX_COMPARE } from '@/lib/constants'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ ids?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tS = await getTranslations({ locale, namespace: 'saved' })
  return buildMetadata({ locale, title: fitTitle(t('savedTitle')), description: tS('lead'), path: pathFor(locale, href.saved()), noindex: true })
}

export default async function SavedPage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const sp = await searchParams
  const catalog = await getCatalog(locale)
  const t = await getTranslations('saved')
  const tNav = await getTranslations('nav')
  const slugs = [...new Set((sp.ids ?? '').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 200)
  const items = slugs.map((s) => catalog.listingBySlug.get(s)).filter((l): l is Listing => Boolean(l))
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: t('title'), path: pathFor(locale, href.saved()) },
  ]
  const empty = (
    <div className="rounded-card border border-dashed border-line-strong bg-surface p-10 text-center">
      <p className="text-[18px] font-semibold">{t('empty')}</p>
      <p className="mt-1 text-muted">{t('emptyLead')}</p>
      <Link href={href.vehicles()} className="btn btn-primary mt-5">
        {tNav('allVehicles')}
      </Link>
    </div>
  )
  return (
    <div className="container-page pt-6">
      <Breadcrumbs items={crumbs} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-ink-2">{t('lead')}</p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <SavedActions />
            {items.length > 1 && (
              <Link href={href.compare(items.slice(0, MAX_COMPARE).map((l) => l.slug))} className="btn btn-primary btn-sm">
                {t('compareAll')}
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="mt-8">
        {items.length > 0 && (
          <>
            <p className="mb-4 text-[14px] font-semibold">{t('count', { count: items.length })}</p>
            <div className="results-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => (
                <VehicleCard key={l.id} listing={l} catalog={catalog} />
              ))}
            </div>
          </>
        )}
        {slugs.length === 0 ? (
          <SavedSync hasIds={false}>{empty}</SavedSync>
        ) : (
          !items.length && empty
        )}
      </div>
    </div>
  )
}
