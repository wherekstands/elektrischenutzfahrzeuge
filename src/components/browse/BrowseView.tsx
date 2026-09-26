import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import {
  activeFilterCount,
  applyFilters,
  computeFacets,
  type FilterState,
  quickChips,
  toQueryString,
} from '@/lib/catalog/filters'
import { formatNumber, unitLabel } from '@/lib/catalog/format'
import { isSponsoredPosition, sortListings, sortOptions } from '@/lib/catalog/rank'
import type { JobNode, Listing, TypeNode } from '@/lib/catalog/types'
import { cn } from '@/lib/cn'
import { PAGE_SIZE, STATUSES } from '@/lib/constants'
import { href, withQuery } from '@/lib/urls'

import { FacetPanel } from './FacetPanel'
import { FilterForm, SubmitOnChangeSelect } from './FilterForm'
import { FiltersShell } from './FiltersShell'
import { LayoutToggle } from './LayoutToggle'

const FORM_ID = 'filters'

type Props = {
  catalog: Catalog
  scope: Listing[]
  state: FilterState
  /** Locale-prefixed path of this hub; filters are applied as query parameters on it. */
  basePath: string
  typeOptions?: TypeNode[] | null
  jobOptions?: JobNode[] | null
  featured?: Listing[]
  headingId?: string
}

const cloneState = (s: FilterState): FilterState => ({
  ...s,
  types: [...s.types],
  jobs: [...s.jobs],
  brands: [...s.brands],
  availability: [...s.availability],
  specs: { ...s.specs },
  page: 1,
})

/** Filters, quick chips, sort, results and pagination. Everything is server-rendered from the URL. */
export async function BrowseView({ catalog, scope, state, basePath, typeOptions = null, jobOptions = null, featured = [], headingId }: Props) {
  const t = await getTranslations('filters')
  const tSort = await getTranslations('sort')
  const tRes = await getTranslations('results')
  const tStatus = await getTranslations('status')
  const locale = (await getLocale()) as Locale

  const url = (s: FilterState) => withQuery(basePath, toQueryString(s, catalog))

  const filtered = applyFilters(scope, state, catalog)
  const sorted = sortListings(filtered, state.sort, catalog, state.q)
  const total = sorted.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(Math.max(1, state.page), pages)
  const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const facets = computeFacets(scope, state, catalog, {
    typeOptions,
    jobOptions,
    labels: {
      type: t('type'),
      job: t('job'),
      brand: t('brand'),
      availability: t('availability'),
      availabilityOptions: Object.fromEntries(STATUSES.map((s) => [s, tStatus(s)])) as Record<(typeof STATUSES)[number], string>,
    },
  })
  const chips = quickChips(scope, state, catalog, {
    onSale: t('onSale'),
    confirmed: t('confirmed'),
    priced: t('priced'),
    licenceB: t('licenceB'),
  })
  const sorts = sortOptions(scope, catalog, state.sort)
  const activeCount = activeFilterCount(state)
  const showFeatured = featured.length > 0 && activeCount === 0 && !state.q && page === 1

  // Active filter pills, each linking to the URL without that filter.
  const pills: { label: string; to: string }[] = []
  for (const slug of state.types) {
    const s = cloneState(state)
    s.types = s.types.filter((x) => x !== slug)
    pills.push({ label: catalog.typeBySlug.get(slug)?.name ?? slug, to: url(s) })
  }
  for (const slug of state.jobs) {
    const s = cloneState(state)
    s.jobs = s.jobs.filter((x) => x !== slug)
    pills.push({ label: catalog.jobBySlug.get(slug)?.name ?? slug, to: url(s) })
  }
  for (const slug of state.brands) {
    const s = cloneState(state)
    s.brands = s.brands.filter((x) => x !== slug)
    pills.push({ label: catalog.brandBySlug.get(slug)?.name ?? slug, to: url(s) })
  }
  for (const a of state.availability) {
    const s = cloneState(state)
    s.availability = s.availability.filter((x) => x !== a)
    pills.push({ label: tStatus(a), to: url(s) })
  }
  if (state.confirmed) pills.push({ label: t('confirmed'), to: url({ ...cloneState(state), confirmed: false }) })
  if (state.priced) pills.push({ label: t('priced'), to: url({ ...cloneState(state), priced: false }) })
  for (const [key, f] of Object.entries(state.specs)) {
    const spec = catalog.specByKey.get(key)
    if (!spec) continue
    const without = cloneState(state)
    delete without.specs[key]
    if (f === true) pills.push({ label: spec.shortLabel, to: url(without) })
    else if (Array.isArray(f)) {
      for (const v of f) {
        const s = cloneState(state)
        const rest = f.filter((x) => x !== v)
        if (rest.length) s.specs[key] = rest
        else delete s.specs[key]
        pills.push({ label: `${spec.shortLabel}: ${spec.options.find((o) => o.value === v)?.label ?? v}`, to: url(s) })
      }
    } else {
      const unit = spec.unit === '€' ? ' €' : spec.unit ? ` ${unitLabel(spec.unit, locale)}` : ''
      const n = (v: number) => formatNumber(v, locale, spec.decimals)
      const range =
        f.min != null && f.max != null
          ? t('between', { min: n(f.min), max: `${n(f.max)}${unit}` })
          : f.min != null
            ? t('from', { value: `${n(f.min)}${unit}` })
            : t('to', { value: `${n(f.max!)}${unit}` })
      pills.push({ label: `${spec.shortLabel} ${range}`, to: url(without) })
    }
  }
  if (state.q) pills.unshift({ label: `“${state.q}”`, to: url({ ...cloneState(state), q: '' }) })

  const sortLabel = (o: (typeof sorts)[number]) => {
    if (o.value === 'recommended') return tSort('recommended')
    if (o.value === 'name') return tSort('name')
    if (o.value === 'updated') return tSort('updated')
    if (o.spec?.key === 'price_eur') return tSort('priceAsc')
    return tSort(o.direction === 'asc' ? 'asc' : 'desc', { label: o.spec?.shortLabel ?? '' })
  }

  const resetUrl = basePath
  const pageUrl = (p: number) => withQuery(basePath, toQueryString({ ...state, page: p }, catalog))

  return (
    <div className="grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside aria-label={t('title')} className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1 lg:[scrollbar-width:thin]">
        <FiltersShell label={t('show')} closeLabel={t('reset')} showLabel={t('showResults', { count: total })} activeCount={activeCount}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[18px] font-bold">{t('title')}</h2>
            {(activeCount > 0 || state.q) && (
              <a href={resetUrl} className="link text-[13.5px]">
                {t('reset')}
              </a>
            )}
          </div>
          <FilterForm id={FORM_ID} action={basePath}>
            <FacetPanel facets={facets} state={state} />
          </FilterForm>
        </FiltersShell>
      </aside>

      <section aria-labelledby={headingId} className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-semibold" aria-live="polite">
            {tRes('count', { count: total })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="sort" className="text-[13px] text-muted">
              {tSort('label')}
            </label>
            <SubmitOnChangeSelect
              id="sort"
              name="sort"
              form={FORM_ID}
              defaultValue={state.sort}
              className="h-9 rounded-full border border-line-strong bg-surface px-3 text-[13.5px] text-ink"
            >
              {sorts.map((o) => (
                <option key={o.value} value={o.value}>
                  {sortLabel(o)}
                </option>
              ))}
            </SubmitOnChangeSelect>
            <Link href={href.ranking()} className="inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-ink" title={tSort('howRanking')}>
              <Info size={14} aria-hidden />
              <span className="hidden sm:inline">{tSort('howRanking')}</span>
            </Link>
            <LayoutToggle target="results" gridLabel={tRes('grid')} listLabel={tRes('list')} />
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={t('quick')}>
            <span className="text-[12.5px] text-muted">{t('quick')}</span>
            {chips.map((c) => (
              <a key={c.id} href={url(c.state)} rel="nofollow" aria-pressed={c.active} className={cn('chip', c.active && 'is-active')}>
                {c.label}
                {!c.active && <span className="num text-[11.5px] text-faint">{c.count}</span>}
              </a>
            ))}
          </div>
        )}

        {pills.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={t('active')}>
            {pills.map((p, i) => (
              <a key={i} href={p.to} className="inline-flex h-7 items-center gap-1 rounded-full bg-accent-soft px-3 text-[13px] text-accent" aria-label={t('remove', { label: p.label })}>
                {p.label}
                <X size={13} aria-hidden />
              </a>
            ))}
            <a href={resetUrl} className="link text-[13px]">
              {t('clearAll')}
            </a>
          </div>
        )}

        {showFeatured && (
          <div className="mt-6">
            <div className="results-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((l) => (
                <VehicleCard key={l.id} listing={l} catalog={catalog} featured priority />
              ))}
            </div>
          </div>
        )}

        {items.length ? (
          <div id="results" data-layout="grid" className="mt-6">
            <ul className="results-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((l, i) => (
                <li key={l.id} className="fade-up flex" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                  <div className="flex w-full">
                    <VehicleCard
                      listing={l}
                      catalog={catalog}
                      sponsored={isSponsoredPosition(l, state.sort, catalog)}
                      priority={!showFeatured && i < 3}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-8 rounded-card border border-dashed border-line-strong bg-surface p-10 text-center">
            <p className="text-[17px] font-semibold">{t('noResults')}</p>
            <p className="mt-1 text-muted">{t('noResultsLead')}</p>
            <a href={resetUrl} className="btn btn-secondary mt-5">
              {t('clearAll')}
            </a>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label={tRes('pagination')} className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
            {page > 1 && (
              <a href={pageUrl(page - 1)} rel="prev" className="btn btn-secondary btn-sm">
                <ChevronLeft size={15} aria-hidden />
                {tRes('previous')}
              </a>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1.5">
                  {i > 0 && p - arr[i - 1] > 1 && <span className="text-faint">…</span>}
                  <a
                    href={pageUrl(p)}
                    aria-current={p === page ? 'page' : undefined}
                    aria-label={tRes('page', { page: p })}
                    className={cn('grid size-9 place-items-center rounded-full text-[14px]', p === page ? 'bg-ink text-bg' : 'hover:bg-surface-2')}
                  >
                    {p}
                  </a>
                </span>
              ))}
            {page < pages && (
              <a href={pageUrl(page + 1)} rel="next" className="btn btn-secondary btn-sm">
                {tRes('next')}
                <ChevronRight size={15} aria-hidden />
              </a>
            )}
          </nav>
        )}
        {total > 0 && pages > 1 && (
          <p className="mt-3 text-center text-[12.5px] text-muted">
            {tRes('showing', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(total, page * PAGE_SIZE), total })}
          </p>
        )}
      </section>
    </div>
  )
}
