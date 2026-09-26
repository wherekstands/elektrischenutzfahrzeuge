import { Download } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { TrustPageView, trustMetadata } from '@/views/trust'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const catalog = await getCatalog(locale)
  if (!catalog.data.settings.openDataEnabled) return { robots: { index: false } }
  return trustMetadata(locale, 'data')
}

/** Open dataset (docs/03 §6, optional): enabled in Settings → Open data. */
export default async function Page({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  if (!catalog.data.settings.openDataEnabled) notFound()
  const t = await getTranslations('data')
  return (
    <TrustPageView
      locale={locale}
      pageKey="data"
      after={
        <section className="mt-8 rounded-card border border-line bg-surface p-6">
          <h2 className="text-[20px] font-bold">{t('downloads')}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`/data/vehicles.${locale}.json`} className="btn btn-secondary btn-sm">
              <Download size={14} aria-hidden />
              {t('json')}
            </a>
            <a href={`/data/vehicles.${locale}.csv`} className="btn btn-secondary btn-sm">
              <Download size={14} aria-hidden />
              {t('csv')}
            </a>
          </div>
          <p className="mt-3 text-[13px] text-muted">{t('licence', { licence: catalog.data.settings.openDataLicence ?? 'CC BY 4.0' })}</p>
        </section>
      }
    />
  )
}
