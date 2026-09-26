import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatPrice, specParts } from '@/lib/catalog/format'
import type { Listing, SpecDef } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

const collator = new Intl.Collator('en', { numeric: true })

/**
 * Plain HTML comparison table of every listing in a hub (docs/03 §7). Readable by crawlers and LLMs
 * without JavaScript; units are spelled out in the header.
 */
export async function HubTable({
  catalog,
  listings,
  figures,
  title,
  showType,
}: {
  catalog: Catalog
  listings: Listing[]
  figures: SpecDef[]
  title: string
  showType: boolean
}) {
  if (listings.length < 2) return null
  const t = await getTranslations('hub')
  const tSpecs = await getTranslations('specs')
  const tStatus = await getTranslations('status')
  const tCompare = await getTranslations('compare')
  const locale = (await getLocale()) as Locale
  const labels = { yes: tSpecs('yes'), no: tSpecs('no'), std: tSpecs('std'), opt: tSpecs('opt'), notAvailable: tSpecs('notAvailable') }
  const rows = [...listings].sort((a, b) => collator.compare(a.title, b.title))
  const cols = figures.filter((f) => f.key !== 'price_eur')

  return (
    <section aria-labelledby="hub-table" className="mt-16">
      <h2 id="hub-table" className="text-[22px] font-bold">
        {title}
      </h2>
      <p className="mt-1 text-[14px] text-muted">{t('tableCaption', { count: rows.length })}</p>
      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-[14px]">
          <thead className="bg-surface-2 text-left text-[12.5px] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                {t('model')}
              </th>
              {showType && (
                <th scope="col" className="px-3 py-3 font-semibold">
                  {tCompare('vehicleType')}
                </th>
              )}
              {cols.map((f) => (
                <th key={f.key} scope="col" className="px-3 py-3 text-right font-semibold">
                  {f.shortLabel}
                  {f.unit && f.unit !== '€' ? ` (${f.unit})` : ''}
                </th>
              ))}
              <th scope="col" className="px-3 py-3 text-right font-semibold">
                {tCompare('price')}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                {tCompare('availability')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const price = l.specs.price_eur
              return (
                <tr key={l.id} className="border-t border-line">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">
                    <Link href={href.vehicle(l.slug)} className="hover:text-accent hover:underline">
                      {l.title}
                    </Link>
                  </th>
                  {showType && <td className="px-3 py-2.5 text-muted">{catalog.typeOf(l).name}</td>}
                  {cols.map((f) => {
                    const p = specParts(f, l.specs[f.key], locale, labels)
                    return (
                      <td key={f.key} className="num px-3 py-2.5 text-right">
                        {p ? p.value : <span className="text-faint">—</span>}
                      </td>
                    )
                  })}
                  <td className="num px-3 py-2.5 text-right">
                    {typeof price === 'number' ? formatPrice(price, locale) : <span className="text-faint">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{tStatus(l.availability)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
