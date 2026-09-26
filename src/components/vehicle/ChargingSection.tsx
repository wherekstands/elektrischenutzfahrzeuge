import { getLocale, getTranslations } from 'next-intl/server'

import { KeyFigure } from '@/components/ui/KeyFigure'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { chargingEstimates, formatNumber, specParts, type ValueLabels } from '@/lib/catalog/format'
import type { Listing } from '@/lib/catalog/types'

export async function ChargingSection({ listing, catalog, labels }: { listing: Listing; catalog: Catalog; labels: ValueLabels }) {
  const t = await getTranslations('vehicle')
  const tSpecs = await getTranslations('specs')
  const locale = (await getLocale()) as Locale
  const type = catalog.typeOf(listing)
  const tiles = ['battery_kwh', 'dc_kw', 'ac_kw', 'voltage']
    .map((k) => catalog.specByKey.get(k))
    .filter((s) => s && type.specKeys.includes(s.key))
  const est = chargingEstimates(listing.specs)
  const publishedDc = listing.specs.charge_time_dc_min

  return (
    <section id="charging" aria-labelledby="charging-title" className="scroll-mt-28">
      <h2 id="charging-title" className="text-[22px] font-bold">
        {t('charging')}
      </h2>
      <div className="mt-4 rounded-card border border-line bg-surface p-5">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((spec) => {
            const p = specParts(spec!, listing.specs[spec!.key], locale, labels)
            return <KeyFigure key={spec!.key} label={spec!.shortLabel} value={p?.value ?? null} unit={p?.unit} missingLabel={tSpecs('notPublished')} size="sm" />
          })}
        </dl>
        {(est.dcMinutes || est.acHours) && typeof publishedDc !== 'number' ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="eyebrow">{t('chargingEstimate')}</p>
            <ul className="mt-2 space-y-1 text-[14.5px] text-ink-2">
              {est.dcMinutes && (
                <li>{t('dcEstimate', { minutes: est.dcMinutes, power: `${formatNumber(listing.specs.dc_kw as number, locale)} kW` })}</li>
              )}
              {est.acHours && (
                <li>{t('acEstimate', { hours: formatNumber(est.acHours, locale, 1), power: `${formatNumber(listing.specs.ac_kw as number, locale)} kW` })}</li>
              )}
            </ul>
            <p className="mt-2 text-[12.5px] text-muted">{t('estimateNote')}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
