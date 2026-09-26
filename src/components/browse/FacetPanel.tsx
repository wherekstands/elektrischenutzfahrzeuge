import { ChevronDown } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import type { Facet, FilterState } from '@/lib/catalog/filters'
import { formatNumber, unitLabel } from '@/lib/catalog/format'
import { cn } from '@/lib/cn'

const VISIBLE_OPTIONS = 7

function Section({ title, open, children, count }: { title: string; open: boolean; children: React.ReactNode; count?: number }) {
  return (
    <details className="group border-b border-line py-3.5" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[14.5px] font-semibold [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {count ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-accent-ink">{count}</span> : null}
        </span>
        <ChevronDown size={16} className="text-muted transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

function OptionRow({ name, value, label, count, checked }: { name: string; value: string; label: string; count: number; checked: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 py-1 text-[14px]', count === 0 && !checked && 'opacity-50')}>
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="size-4 rounded accent-[var(--accent)]" />
      <span className="min-w-0 flex-1 truncate text-ink-2">{label}</span>
      <span className="num text-[12px] text-faint">{count}</span>
    </label>
  )
}

/**
 * Filter controls inside the <FilterForm>. Plain inputs with the URL parameter names, so the form also
 * works without JavaScript. Sections use <details> (open by default for the first ones and active ones).
 */
export async function FacetPanel({ facets, state }: { facets: Facet[]; state: FilterState }) {
  const t = await getTranslations('filters')
  const locale = (await getLocale()) as Locale

  return (
    <div className="text-ink">
      <div className="border-b border-line pb-3.5">
        <label htmlFor="filter-q" className="sr-only">
          {t('search')}
        </label>
        <input id="filter-q" name="q" type="search" defaultValue={state.q} placeholder={t('search')} className="input h-10 text-[14px]" />
      </div>

      <div className="border-b border-line py-3.5">
        <p className="mb-2 text-[14.5px] font-semibold">{t('dataQuality')}</p>
        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px]">
          <input type="checkbox" name="confirmed" value="1" defaultChecked={state.confirmed} className="size-4 accent-[var(--accent)]" />
          <span className="text-ink-2">{t('confirmed')}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px]">
          <input type="checkbox" name="priced" value="1" defaultChecked={state.priced} className="size-4 accent-[var(--accent)]" />
          <span className="text-ink-2">{t('priced')}</span>
        </label>
      </div>

      {facets.map((facet, index) => {
        const open = index < 5 || ('selected' in facet && Boolean(facet.selected && (facet.kind !== 'range' || facet.selected.min != null || facet.selected.max != null)))
        if (facet.kind === 'options') {
          const selectedCount = facet.options.filter((o) => o.selected).length
          const visible = facet.options.slice(0, VISIBLE_OPTIONS)
          const rest = facet.options.slice(VISIBLE_OPTIONS)
          return (
            <Section key={facet.key} title={facet.label} open={open || selectedCount > 0} count={selectedCount}>
              <fieldset>
                <legend className="sr-only">{facet.label}</legend>
                {visible.map((o) => (
                  <OptionRow key={o.value} name={facet.param} value={o.value} label={o.label} count={o.count} checked={o.selected} />
                ))}
                {rest.length > 0 && (
                  <details className="group/more" open={rest.some((o) => o.selected)}>
                    <summary className="link cursor-pointer list-none py-1 text-[13.5px] [&::-webkit-details-marker]:hidden">
                      <span className="group-open/more:hidden">{t('showMore', { count: facet.options.length })}</span>
                      <span className="hidden group-open/more:inline">{t('showLess')}</span>
                    </summary>
                    {rest.map((o) => (
                      <OptionRow key={o.value} name={facet.param} value={o.value} label={o.label} count={o.count} checked={o.selected} />
                    ))}
                  </details>
                )}
              </fieldset>
            </Section>
          )
        }
        if (facet.kind === 'range') {
          const unit = facet.spec.unit === '€' ? '€' : unitLabel(facet.spec.unit, locale)
          const active = facet.selected.min != null || facet.selected.max != null
          return (
            <Section key={facet.key} title={facet.label} open={open || active} count={active ? 1 : 0}>
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="sr-only">{facet.label}</legend>
                {(['min', 'max'] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="mb-1 block text-[12px] text-muted">
                      {t(k)} {unit && <span className="text-faint">({unit})</span>}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      name={`${facet.param}_${k}`}
                      defaultValue={facet.selected[k] ?? ''}
                      placeholder={formatNumber(k === 'min' ? facet.domain.min : facet.domain.max, locale, facet.spec.decimals)}
                      className="input num h-9 px-2.5 text-[14px]"
                    />
                  </label>
                ))}
              </fieldset>
            </Section>
          )
        }
        return (
          <div key={facet.key} className="border-b border-line py-3">
            <label className={cn('flex cursor-pointer items-center gap-2.5 text-[14px]', facet.count === 0 && !facet.selected && 'opacity-50')}>
              <input type="checkbox" name={facet.param} value="1" defaultChecked={facet.selected} className="size-4 accent-[var(--accent)]" />
              <span className="flex-1 font-medium text-ink-2">{facet.label}</span>
              <span className="num text-[12px] text-faint">{facet.count}</span>
            </label>
          </div>
        )
      })}

      <noscript>
        <button type="submit" className="btn btn-primary mt-4 w-full">
          {t('apply')}
        </button>
      </noscript>
    </div>
  )
}
