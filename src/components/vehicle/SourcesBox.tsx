import { FileCode2 } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatDate } from '@/lib/catalog/format'
import type { Listing } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

/** Trust signals on every listing (docs/03 §6): data source, last update, methodology, markdown twin. */
export async function SourcesBox({ listing, catalog, markdownPath }: { listing: Listing; catalog: Catalog; markdownPath: string }) {
  const t = await getTranslations('vehicle')
  const tLabels = await getTranslations('labels')
  const locale = (await getLocale()) as Locale
  const brand = catalog.brandOf(listing)
  const verified = catalog.isVerified(listing)
  return (
    <section aria-labelledby="sources-title" className="rounded-card bg-surface-2 p-5 text-[14px] text-ink-2">
      <h2 id="sources-title" className="text-[16px] font-bold text-ink">
        {t('sources')}
      </h2>
      <p className="mt-2">
        {verified ? tLabels('confirmedOn', { brand: brand.name, date: formatDate(listing.verifiedAt, locale) }) : tLabels('publicSources')}{' '}
        {t('lastUpdated', { date: formatDate(listing.updatedAt, locale) })}
      </p>
      {(listing.sourceUrl || listing.sources.length > 0) && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {listing.sourceUrl && (
            <li>
              <a href={listing.sourceUrl} target="_blank" rel="noopener" className="link">
                {t('manufacturerPage')} ({brand.name})
              </a>
            </li>
          )}
          {listing.sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener" className="link">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[13px] text-muted">
        {catalog.data.settings.notice || t('notice')}{' '}
        <Link href={href.methodology()} className="link">
          {t('methodology')}
        </Link>{' '}
        ·{' '}
        <Link href={href.correction(listing.slug)} rel="nofollow" className="link">
          {t('suggestCorrection')}
        </Link>{' '}
        ·{' '}
        <a href={markdownPath} className="link inline-flex items-center gap-1" type="text/markdown">
          <FileCode2 size={13} aria-hidden />
          {t('mdTwin')}
        </a>
      </p>
    </section>
  )
}
