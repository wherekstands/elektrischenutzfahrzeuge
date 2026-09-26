import { Check, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { SaveButton } from '@/components/client/SaveButton'
import { ClearCompare, CompareActions, CompareSync, DiffToggle, RemoveFromCompare } from '@/components/compare/CompareClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { VehicleImage } from '@/components/ui/VehicleImage'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { formatPrice, formatSpec } from '@/lib/catalog/format'
import { similarListings } from '@/lib/catalog/rank'
import type { Listing, SpecDef } from '@/lib/catalog/types'
import { cn } from '@/lib/cn'
import { MAX_COMPARE, SPEC_GROUPS } from '@/lib/constants'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { valueLabels } from '@/views/vehicle'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ ids?: string; diff?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tC = await getTranslations({ locale, namespace: 'compare' })
  return buildMetadata({ locale, title: fitTitle(t('compareTitle')), description: tC('lead'), path: pathFor(locale, href.compare()), noindex: true })
}

type Cell = { text: string | null; raw?: unknown; applicable: boolean }
type Row = { key: string; label: string; help?: string | null; cells: Cell[]; best: Set<number>; same: boolean; group: string }

function bestIndexes(spec: SpecDef, cells: Cell[]): Set<number> {
  const nums = cells.map((c, i) => [i, c.raw] as const).filter((x): x is readonly [number, number] => typeof x[1] === 'number')
  if (!spec.better || nums.length < 2) return new Set()
  const target = spec.better === 'high' ? Math.max(...nums.map((x) => x[1])) : Math.min(...nums.map((x) => x[1]))
  if (nums.every((x) => x[1] === target)) return new Set()
  return new Set(nums.filter((x) => x[1] === target).map((x) => x[0]))
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const sp = await searchParams
  const catalog = await getCatalog(locale)
  const t = await getTranslations('compare')
  const tNav = await getTranslations('nav')
  const tSpecs = await getTranslations('specs')
  const tStatus = await getTranslations('status')
  const tLabels = await getTranslations('labels')
  const tCard = await getTranslations('card')
  const labels = await valueLabels(locale)

  const slugs = [...new Set((sp.ids ?? '').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, MAX_COMPARE)
  const items = slugs.map((s) => catalog.listingBySlug.get(s)).filter((l): l is Listing => Boolean(l))
  const path = pathFor(locale, href.compare())
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: t('title'), path },
  ]

  // Rows: overview + every compare spec that applies to at least one vehicle, in page order.
  const rows: Row[] = []
  const push = (group: string, key: string, label: string, cells: Cell[], best = new Set<number>(), help?: string | null) => {
    const texts = cells.map((c) => c.text ?? '')
    rows.push({ group, key, label, help, cells, best, same: texts.every((x) => x === texts[0]) })
  }
  if (items.length) {
    push('overview', 'type', t('vehicleType'), items.map((l) => ({ text: catalog.typeOf(l).name, applicable: true })))
    push('overview', 'availability', t('availability'), items.map((l) => ({ text: tStatus(l.availability), applicable: true })))
    push('overview', 'jobs', t('usedFor'), items.map((l) => ({ text: catalog.jobsOf(l).map((j) => j.name).join(', ') || null, applicable: true })))
    push(
      'overview',
      'source',
      t('dataSource'),
      items.map((l) => ({
        text: catalog.isVerified(l) ? tLabels('confirmedBy', { brand: catalog.brandOf(l).name }) : tLabels('publicSources').split('.')[0],
        applicable: true,
      })),
    )
    const keys = new Set(items.flatMap((l) => catalog.typeOf(l).specKeys))
    for (const spec of catalog.specs) {
      if (!spec.showInCompare || !keys.has(spec.key)) continue
      const cells = items.map((l) => ({
        text: formatSpec(spec, l.specs[spec.key], locale, labels),
        raw: l.specs[spec.key],
        applicable: catalog.typeOf(l).specKeys.includes(spec.key),
      }))
      if (cells.every((c) => c.text == null)) continue
      push(spec.group, spec.key, spec.label, cells, bestIndexes(spec, cells), spec.help)
    }
  }
  const suggestions = items.length
    ? similarListings(items[0], catalog, 8).filter((l) => !slugs.includes(l.slug)).slice(0, 4)
    : []
  const groups = ['overview', ...SPEC_GROUPS].filter((g) => rows.some((r) => r.group === g))
  const colTemplate = `minmax(160px,220px) repeat(${items.length}, minmax(190px,1fr))`

  return (
    <div className="container-page pt-6">
      <CompareSync items={items.map((l) => ({ slug: l.slug, title: l.title }))} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold">{t('title')}</h1>
          <p className="mt-2 text-ink-2">{t('lead')}</p>
        </div>
        {items.length > 0 && <ClearCompare label={t('clear')} />}
      </div>

      {!items.length ? (
        <div className="mt-10 rounded-card border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="text-[18px] font-semibold">{t('empty')}</p>
          <p className="mt-1 text-muted">{t('emptyLead')}</p>
          <Link href={href.vehicles()} className="btn btn-primary mt-5">
            {t('browse')}
          </Link>
        </div>
      ) : (
        <>
          {suggestions.length > 0 && items.length < MAX_COMPARE && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-muted">{t('addSimilar')}</span>
              {suggestions.map((s) => (
                <Link key={s.id} href={href.compare([...slugs, s.slug])} className="chip" rel="nofollow">
                  <Plus size={13} aria-hidden />
                  {s.title}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <DiffToggle target="compare-table" initial={sp.diff === '1'} />
            <CompareActions tableId="compare-table-el" filename="ecv-base-comparison.csv" />
          </div>

          <div id="compare-table" data-diff={sp.diff === '1' ? '1' : '0'} className="mt-4 overflow-x-auto rounded-card border border-line bg-surface">
            <table id="compare-table-el" className="w-full table-fixed border-collapse text-[14px]" style={{ minWidth: 200 + items.length * 200 }}>
              <colgroup>
                <col style={{ width: 200 }} />
                {items.map((l) => (
                  <col key={l.id} />
                ))}
              </colgroup>
              <thead>
                <tr className="align-top">
                  <th scope="col" className="p-4 text-left align-bottom">
                    <span className="eyebrow">{t('vehicles', { count: items.length })}</span>
                  </th>
                  {items.map((l) => {
                    const type = catalog.typeOf(l)
                    const price = l.specs.price_eur
                    return (
                      <th key={l.id} scope="col" className="p-4 text-left font-normal">
                        <div className="w-40 overflow-hidden rounded-box border border-line">
                          <VehicleImage image={l.images[0]} illustration={type.illustration} seed={l.slug} alt={l.title} sizes="160px" />
                        </div>
                        <p className="eyebrow mt-3">{catalog.brandOf(l).name}</p>
                        <Link href={href.vehicle(l.slug)} className="block text-[16px] font-bold leading-snug hover:underline">
                          {l.model}
                        </Link>
                        <p className="mt-1 text-[13px] text-muted">
                          {typeof price === 'number' ? tCard('priceFrom', { price: formatPrice(price, locale) }) : tCard('priceOnRequest')}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <SaveButton slug={l.slug} title={l.title} className="size-8" />
                          <RemoveFromCompare slug={l.slug} title={l.title} remaining={slugs.filter((s) => s !== l.slug)} />
                          <Link href={href.vehicle(l.slug)} className="link ml-auto text-[13px]">
                            {tCard('details')} →
                          </Link>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-surface-2">
                  <th colSpan={items.length + 1} scope="colgroup" className="px-4 py-2.5 text-left">
                    <span className="eyebrow text-ink">{t('atAGlance')}</span>
                  </th>
                </tr>
                <tr className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 text-left font-normal text-muted">
                    {t('atAGlance')}
                  </th>
                  {items.map((l) => (
                    <td key={l.id} className="px-4 py-3">
                      <ul className="space-y-1.5">
                        {l.keyFacts.map((f, i) => (
                          <li key={i} className="flex gap-2 text-[13.5px] text-ink-2">
                            <Check size={15} className="mt-0.5 shrink-0 text-good" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                {groups.map((g) => (
                  <GroupRows key={g} title={g === 'overview' ? t('overview') : tSpecs(`groups.${g}`)} rows={rows.filter((r) => r.group === g)} colTemplate={colTemplate} naLabel={t('notApplicable')} bestLabel={t('best')} missing={tSpecs('notPublished')} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function GroupRows({ title, rows, naLabel, bestLabel, missing }: { title: string; rows: Row[]; colTemplate: string; naLabel: string; bestLabel: string; missing: string }) {
  const allSame = rows.every((r) => r.same)
  return (
    <>
      <tr className="bg-surface-2" data-same={allSame ? '1' : '0'}>
        <th colSpan={(rows[0]?.cells.length ?? 0) + 1} scope="colgroup" className="px-4 py-2.5 text-left">
          <span className="eyebrow text-ink">{title}</span>
        </th>
      </tr>
      {rows.map((r) => (
        <tr key={r.key} data-same={r.same ? '1' : '0'} className="border-t border-line align-top">
          <th scope="row" className="px-4 py-3 text-left font-normal text-muted">
            {r.label}
          </th>
          {r.cells.map((c, i) => {
            const best = r.best.has(i)
            return (
              <td key={i} className={cn('px-4 py-3', best && 'bg-good-soft/60')}>
                {c.text ? (
                  <span className={cn(typeof c.raw === 'number' && 'num', best && 'font-semibold text-good')}>
                    {c.text}
                    {best && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide">
                        <Check size={12} aria-hidden />
                        <span className="sr-only sm:not-sr-only">{bestLabel}</span>
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-[13px] text-faint">{c.applicable ? missing : naLabel}</span>
                )}
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
