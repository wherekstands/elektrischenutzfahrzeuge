import { Plug } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatSpec, type ValueLabels } from '@/lib/catalog/format'
import type { Listing, SpecDef } from '@/lib/catalog/types'
import { SPEC_GROUPS } from '@/lib/constants'
import { href } from '@/lib/urls'

/**
 * Full specification table. Every spec of the type's profile gets a row (missing ones say
 * "Not published"), so all listings of one type have identical structure. Groups follow a fixed order.
 */
export async function SpecSheet({ listing, catalog, labels }: { listing: Listing; catalog: Catalog; labels: ValueLabels }) {
  const t = await getTranslations('specs')
  const tV = await getTranslations('vehicle')
  const locale = (await getLocale()) as Locale
  const specs = catalog.profileSpecs(listing)
  const byGroup = new Map<string, SpecDef[]>()
  for (const s of specs) byGroup.set(s.group, [...(byGroup.get(s.group) ?? []), s])
  const filled = specs.filter((s) => formatSpec(s, listing.specs[s.key], locale, labels) != null).length

  return (
    <section id="specifications" aria-labelledby="specs-title" className="scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="specs-title" className="text-[22px] font-bold">
          {t('title')}
        </h2>
        <span className="text-[13px] text-muted">{tV('specsCount', { filled, total: specs.length })}</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
        {SPEC_GROUPS.filter((g) => byGroup.has(g)).map((g) => (
          <div key={g} className="border-b border-line px-5 py-4 last:border-b-0">
            <h3 className="eyebrow mb-2">{t(`groups.${g}`)}</h3>
            <dl className="divide-y divide-line/70">
              {byGroup.get(g)!.map((spec) => {
                const value = listing.specs[spec.key]
                const text = formatSpec(spec, value, locale, labels)
                return (
                  <div key={spec.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 py-2.5 text-[14.5px]">
                    <dt className="text-ink-2">
                      {spec.label}
                      {spec.help && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{spec.help}</span>}
                    </dt>
                    <dd className={text ? 'num text-ink' : 'text-[13.5px] text-faint'}>
                      {spec.key === 'charging' && Array.isArray(value) ? (
                        <span className="flex flex-wrap gap-1.5 font-sans">
                          {(value as string[]).map((v) => (
                            <span key={v} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-[13px]">
                              <Plug size={12} aria-hidden />
                              {spec.options.find((o) => o.value === v)?.label ?? v}
                            </span>
                          ))}
                        </span>
                      ) : spec.dataType === 'number' || !text ? (
                        (text ?? t('notPublished'))
                      ) : (
                        <span className="font-sans">{text}</span>
                      )}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        ))}
      </div>
      {filled < specs.length && (
        <p className="mt-3 text-[13px] text-muted">
          {t('missing', { count: specs.length - filled })}{' '}
          <Link href={href.correction(listing.slug)} rel="nofollow" className="link">
            {t('knowValue')}
          </Link>
        </p>
      )}
    </section>
  )
}
