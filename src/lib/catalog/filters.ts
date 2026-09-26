/**
 * Filters, facets and search. URL format (docs/03 §1, stable and human-readable):
 *
 *   ?q=sweeper&type=small-vans,large-vans&job=waste-collection&brand=ford&availability=on-sale
 *   &confirmed=1&priced=1&range_min=300&payload_max=1500&ports=ccs2,mcs&v2x=1&sort=range-desc&page=2
 *
 * Spec filters use each spec's `urlKey`. Unknown parameters are ignored.
 */
import { STATUSES, type Status } from '../constants'
import type { Catalog } from './catalog'
import type { JobNode, Listing, SpecDef, TypeNode } from './types'

export type NumRange = { min?: number; max?: number }
export type SpecFilter = NumRange | string[] | true

export type SortKey = string // 'recommended' | 'name' | 'updated' | `${urlKey}-asc` | `${urlKey}-desc`

export type FilterState = {
  q: string
  types: string[]
  jobs: string[]
  brands: string[]
  availability: Status[]
  confirmed: boolean
  priced: boolean
  specs: Record<string, SpecFilter>
  sort: SortKey
  page: number
}

export const emptyFilters = (): FilterState => ({
  q: '',
  types: [],
  jobs: [],
  brands: [],
  availability: [],
  confirmed: false,
  priced: false,
  specs: {},
  sort: 'recommended',
  page: 1,
})

type Params = URLSearchParams | Record<string, string | string[] | undefined>

const getParam = (params: Params, key: string): string | undefined => {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined
  const v = params[key]
  return Array.isArray(v) ? v[0] : v
}

const list = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const num = (v: string | undefined) => {
  if (v == null || v === '') return undefined
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

/** Parameter names that belong to the filter state (everything else is ignored). */
export function filterParamNames(catalog: Catalog): Set<string> {
  const names = new Set(['q', 'type', 'job', 'brand', 'availability', 'confirmed', 'priced', 'sort', 'page'])
  for (const s of catalog.specs) {
    if (!s.filterable) continue
    if (s.dataType === 'number') {
      names.add(`${s.urlKey}_min`)
      names.add(`${s.urlKey}_max`)
    } else names.add(s.urlKey)
  }
  return names
}

export function parseFilters(params: Params, catalog: Catalog): FilterState {
  const state = emptyFilters()
  state.q = (getParam(params, 'q') ?? '').trim().slice(0, 120)
  state.types = list(getParam(params, 'type')).filter((s) => catalog.typeBySlug.has(s))
  state.jobs = list(getParam(params, 'job')).filter((s) => catalog.jobBySlug.has(s))
  state.brands = list(getParam(params, 'brand')).filter((s) => catalog.brandBySlug.has(s))
  state.availability = list(getParam(params, 'availability')).filter((s): s is Status =>
    (STATUSES as readonly string[]).includes(s),
  )
  state.confirmed = getParam(params, 'confirmed') === '1'
  state.priced = getParam(params, 'priced') === '1'
  for (const spec of catalog.specs) {
    if (!spec.filterable) continue
    if (spec.dataType === 'number') {
      const min = num(getParam(params, `${spec.urlKey}_min`))
      const max = num(getParam(params, `${spec.urlKey}_max`))
      if (min != null || max != null) state.specs[spec.key] = { ...(min != null && { min }), ...(max != null && { max }) }
    } else if (spec.dataType === 'select' || spec.dataType === 'multiselect') {
      const allowed = new Set(spec.options.map((o) => o.value))
      const values = list(getParam(params, spec.urlKey)).filter((v) => allowed.has(v))
      if (values.length) state.specs[spec.key] = values
    } else if (spec.dataType === 'boolean' || spec.dataType === 'feature') {
      if (getParam(params, spec.urlKey) === '1') state.specs[spec.key] = true
    }
  }
  const sort = getParam(params, 'sort')
  if (sort && isValidSort(sort, catalog)) state.sort = sort
  const page = num(getParam(params, 'page'))
  state.page = page && page >= 1 ? Math.floor(page) : 1
  return state
}

export function isValidSort(sort: string, catalog: Catalog): boolean {
  if (sort === 'recommended' || sort === 'name' || sort === 'updated') return true
  const m = /^(.+)-(asc|desc)$/.exec(sort)
  if (!m) return false
  const spec = catalog.specByUrlKey.get(m[1])
  return Boolean(spec && spec.dataType === 'number')
}

/** Serialise to URLSearchParams in a stable order. Defaults are omitted. */
export function serializeFilters(state: FilterState, catalog: Catalog): URLSearchParams {
  const p = new URLSearchParams()
  if (state.q) p.set('q', state.q)
  if (state.types.length) p.set('type', state.types.join(','))
  if (state.jobs.length) p.set('job', state.jobs.join(','))
  if (state.brands.length) p.set('brand', state.brands.join(','))
  if (state.availability.length) p.set('availability', state.availability.join(','))
  if (state.confirmed) p.set('confirmed', '1')
  if (state.priced) p.set('priced', '1')
  for (const spec of catalog.specs) {
    const f = state.specs[spec.key]
    if (f == null) continue
    if (f === true) p.set(spec.urlKey, '1')
    else if (Array.isArray(f)) {
      if (f.length) p.set(spec.urlKey, f.join(','))
    } else {
      if (f.min != null) p.set(`${spec.urlKey}_min`, String(f.min))
      if (f.max != null) p.set(`${spec.urlKey}_max`, String(f.max))
    }
  }
  if (state.sort && state.sort !== 'recommended') p.set('sort', state.sort)
  if (state.page > 1) p.set('page', String(state.page))
  return p
}

export const toQueryString = (state: FilterState, catalog: Catalog) => {
  const s = serializeFilters(state, catalog).toString()
  return s ? `?${s}` : ''
}

/** Number of active filters (search, sort and page excluded). */
export function activeFilterCount(state: FilterState): number {
  return (
    state.types.length +
    state.jobs.length +
    state.brands.length +
    state.availability.length +
    (state.confirmed ? 1 : 0) +
    (state.priced ? 1 : 0) +
    Object.keys(state.specs).length
  )
}

export const hasFacetParams = (state: FilterState) =>
  Boolean(state.q) || activeFilterCount(state) > 0 || state.sort !== 'recommended' || state.page > 1

// ── Search ────────────────────────────────────────────────────────────────────────────────

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()

export const tokenize = (q: string) => normalize(q).split(/\s+/).filter(Boolean)

type Haystack = { strong: string; medium: string; weak: string }
const haystackCache = new WeakMap<Listing, Haystack>()

function haystack(l: Listing, catalog: Catalog): Haystack {
  const cached = haystackCache.get(l)
  if (cached) return cached
  const brand = catalog.brandOf(l)
  const type = catalog.typeOf(l)
  const group = catalog.groupOf(type)
  const jobs = catalog.jobsOf(l)
  const h = {
    strong: normalize(`${brand.name} ${l.model} ${l.family ?? ''} ${l.slug.replace(/-/g, ' ')}`),
    medium: normalize(
      [type.name, group.name, ...type.synonyms, ...group.synonyms, ...jobs.map((j) => j.name), ...jobs.flatMap((j) => j.synonyms)].join(
        ' ',
      ),
    ),
    weak: normalize(`${l.summary} ${l.keyFacts.join(' ')}`),
  }
  haystackCache.set(l, h)
  return h
}

/**
 * Relevance of a listing for search tokens: every token must match somewhere
 * (brand/model 3 points, type/job/synonyms 2, summary 1; prefix matches count).
 * Returns 0 when a token does not match at all.
 */
export function searchScore(l: Listing, tokens: string[], catalog: Catalog): number {
  if (!tokens.length) return 1
  const h = haystack(l, catalog)
  let score = 0
  for (const t of tokens) {
    const re = new RegExp(`(^|\\s)${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
    if (re.test(h.strong)) score += 3
    else if (re.test(h.medium)) score += 2
    else if (h.strong.includes(t) || h.medium.includes(t)) score += 1.5
    else if (re.test(h.weak)) score += 1
    else return 0
  }
  return score
}

// ── Matching ──────────────────────────────────────────────────────────────────────────────

export type FacetKey = 'q' | 'type' | 'job' | 'brand' | 'availability' | 'confirmed' | 'priced' | `spec:${string}`

const hasValue = (v: unknown) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0)

export function specMatches(spec: SpecDef, value: unknown, filter: SpecFilter): boolean {
  if (filter === true) return spec.dataType === 'feature' ? value === 'std' || value === 'opt' : value === true
  if (Array.isArray(filter)) {
    if (!filter.length) return true
    if (spec.dataType === 'multiselect') return Array.isArray(value) && value.some((v) => filter.includes(String(v)))
    return typeof value === 'string' && filter.includes(value)
  }
  if (typeof value !== 'number') return false
  if (filter.min != null && value < filter.min) return false
  if (filter.max != null && value > filter.max) return false
  return true
}

type MatchContext = { tokens: string[]; typeIds: Set<number> | null; jobIds: Set<number> | null; brandIds: Set<number> | null }

function context(state: FilterState, catalog: Catalog): MatchContext {
  const typeIds = state.types.length
    ? new Set(state.types.flatMap((s) => [...catalog.typeScope(catalog.typeBySlug.get(s)!)]))
    : null
  const jobIds = state.jobs.length ? new Set(state.jobs.flatMap((s) => [...catalog.jobScope(catalog.jobBySlug.get(s)!)])) : null
  const brandIds = state.brands.length ? new Set(state.brands.map((s) => catalog.brandBySlug.get(s)!.id)) : null
  return { tokens: tokenize(state.q), typeIds, jobIds, brandIds }
}

function matches(l: Listing, state: FilterState, catalog: Catalog, ctx: MatchContext, skip?: FacetKey): boolean {
  if (skip !== 'q' && ctx.tokens.length && searchScore(l, ctx.tokens, catalog) === 0) return false
  if (skip !== 'type' && ctx.typeIds && !ctx.typeIds.has(l.typeId)) return false
  if (skip !== 'job' && ctx.jobIds && !l.jobIds.some((id) => ctx.jobIds!.has(id))) return false
  if (skip !== 'brand' && ctx.brandIds && !ctx.brandIds.has(l.brandId)) return false
  if (skip !== 'availability' && state.availability.length && !state.availability.includes(l.availability)) return false
  if (skip !== 'confirmed' && state.confirmed && !catalog.isVerified(l)) return false
  if (skip !== 'priced' && state.priced && !catalog.hasPrice(l)) return false
  for (const [key, filter] of Object.entries(state.specs)) {
    if (skip === `spec:${key}`) continue
    const spec = catalog.specByKey.get(key)
    if (spec && !specMatches(spec, l.specs[key], filter)) return false
  }
  return true
}

export function applyFilters(scope: Listing[], state: FilterState, catalog: Catalog, skip?: FacetKey): Listing[] {
  const ctx = context(state, catalog)
  return scope.filter((l) => matches(l, state, catalog, ctx, skip))
}

// ── Facets ────────────────────────────────────────────────────────────────────────────────

export type FacetOption = { value: string; label: string; count: number; selected: boolean }

export type Facet =
  | { key: FacetKey; param: string; label: string; kind: 'options'; options: FacetOption[]; spec?: SpecDef }
  | {
      key: FacetKey
      param: string
      label: string
      kind: 'range'
      spec: SpecDef
      domain: { min: number; max: number }
      selected: NumRange
      count: number
    }
  | { key: FacetKey; param: string; label: string; kind: 'toggle'; spec?: SpecDef; count: number; selected: boolean }

export type FacetLabels = {
  type: string
  job: string
  brand: string
  availability: string
  availabilityOptions: Record<Status, string>
}

/**
 * Facets for a scope of listings. Counts are "if you add this option" counts: every facet is counted
 * against the results of all *other* active filters.
 */
export function computeFacets(
  scope: Listing[],
  state: FilterState,
  catalog: Catalog,
  opts: { typeOptions: TypeNode[] | null; jobOptions: JobNode[] | null; labels: FacetLabels },
): Facet[] {
  const facets: Facet[] = []
  const ctx = context(state, catalog)
  const without = (skip: FacetKey) => scope.filter((l) => matches(l, state, catalog, ctx, skip))

  if (opts.typeOptions && opts.typeOptions.length > 1) {
    const base = without('type')
    const options = opts.typeOptions
      .map((t) => {
        const ids = catalog.typeScope(t)
        return {
          value: t.slug,
          label: t.name,
          count: base.filter((l) => ids.has(l.typeId)).length,
          selected: state.types.includes(t.slug),
        }
      })
      .filter((o) => o.count > 0 || o.selected)
    if (options.length > 1 || options.some((o) => o.selected))
      facets.push({ key: 'type', param: 'type', label: opts.labels.type, kind: 'options', options })
  }

  if (opts.jobOptions && opts.jobOptions.length > 1) {
    const base = without('job')
    const options = opts.jobOptions
      .map((j) => {
        const ids = catalog.jobScope(j)
        return {
          value: j.slug,
          label: j.name,
          count: base.filter((l) => l.jobIds.some((id) => ids.has(id))).length,
          selected: state.jobs.includes(j.slug),
        }
      })
      .filter((o) => o.count > 0 || o.selected)
    if (options.length > 1 || options.some((o) => o.selected))
      facets.push({ key: 'job', param: 'job', label: opts.labels.job, kind: 'options', options })
  }

  {
    const base = without('brand')
    const brandIds = new Set(scope.map((l) => l.brandId))
    const options = catalog.brands
      .filter((b) => brandIds.has(b.id))
      .map((b) => ({
        value: b.slug,
        label: b.name,
        count: base.filter((l) => l.brandId === b.id).length,
        selected: state.brands.includes(b.slug),
      }))
      .filter((o) => o.count > 0 || o.selected)
    if (options.length > 1 || options.some((o) => o.selected))
      facets.push({ key: 'brand', param: 'brand', label: opts.labels.brand, kind: 'options', options })
  }

  {
    const base = without('availability')
    const present = new Set(scope.map((l) => l.availability))
    const options = STATUSES.filter((s) => present.has(s)).map((s) => ({
      value: s,
      label: opts.labels.availabilityOptions[s],
      count: base.filter((l) => l.availability === s).length,
      selected: state.availability.includes(s),
    }))
    if (options.length > 1 || options.some((o) => o.selected))
      facets.push({ key: 'availability', param: 'availability', label: opts.labels.availability, kind: 'options', options })
  }

  // Spec facets: specs of the types present in scope, in page order.
  const keys = new Set<string>()
  for (const l of scope) for (const k of catalog.typeOf(l).specKeys) keys.add(k)
  for (const spec of catalog.specs) {
    if (!spec.filterable || !keys.has(spec.key)) continue
    const fkey: FacetKey = `spec:${spec.key}`
    const selected = state.specs[spec.key]
    if (spec.dataType === 'number') {
      const values = scope.map((l) => l.specs[spec.key]).filter((v): v is number => typeof v === 'number')
      if (values.length < 2 && !selected) continue
      const min = Math.min(...values)
      const max = Math.max(...values)
      if (min === max && !selected) continue
      const base = without(fkey)
      facets.push({
        key: fkey,
        param: spec.urlKey,
        label: spec.label,
        kind: 'range',
        spec,
        domain: { min, max },
        selected: selected && !Array.isArray(selected) && selected !== true ? selected : {},
        count: base.filter((l) => typeof l.specs[spec.key] === 'number').length,
      })
    } else if (spec.dataType === 'select' || spec.dataType === 'multiselect') {
      const base = without(fkey)
      const sel = Array.isArray(selected) ? selected : []
      const options = spec.options
        .map((o) => ({
          value: o.value,
          label: o.label,
          count: base.filter((l) => specMatches(spec, l.specs[spec.key], [o.value])).length,
          selected: sel.includes(o.value),
        }))
        .filter((o) => o.count > 0 || o.selected)
      const inScope = scope.filter((l) => hasValue(l.specs[spec.key])).length
      if ((options.length > 1 && inScope > 1) || sel.length)
        facets.push({ key: fkey, param: spec.urlKey, label: spec.label, kind: 'options', options, spec })
    } else if (spec.dataType === 'boolean' || spec.dataType === 'feature') {
      const base = without(fkey)
      const count = base.filter((l) => specMatches(spec, l.specs[spec.key], true)).length
      if (count > 0 || selected)
        facets.push({ key: fkey, param: spec.urlKey, label: spec.label, kind: 'toggle', spec, count, selected: selected === true })
    }
  }
  return facets
}

// ── Quick filters ─────────────────────────────────────────────────────────────────────────

export type QuickChip = { id: string; label: string; active: boolean; count: number; state: FilterState }

const clone = (s: FilterState): FilterState => ({
  ...s,
  types: [...s.types],
  jobs: [...s.jobs],
  brands: [...s.brands],
  availability: [...s.availability],
  specs: { ...s.specs },
  page: 1,
})

/**
 * One-tap presets that map onto normal filters. A chip is only shown when it changes the result
 * (it matches some, but not all, of the current results).
 */
export function quickChips(
  scope: Listing[],
  state: FilterState,
  catalog: Catalog,
  labels: { onSale: string; confirmed: string; priced: string; licenceB: string },
  max = 7,
): QuickChip[] {
  const current = applyFilters(scope, state, catalog)
  const keys = new Set<string>()
  for (const l of scope) for (const k of catalog.typeOf(l).specKeys) keys.add(k)

  const presets: { id: string; label: string; active: boolean; toggle: (s: FilterState, on: boolean) => void }[] = [
    {
      id: 'on-sale',
      label: labels.onSale,
      active: state.availability.length === 1 && state.availability[0] === 'on-sale',
      toggle: (s, on) => (s.availability = on ? ['on-sale'] : []),
    },
    { id: 'confirmed', label: labels.confirmed, active: state.confirmed, toggle: (s, on) => (s.confirmed = on) },
    { id: 'priced', label: labels.priced, active: state.priced, toggle: (s, on) => (s.priced = on) },
  ]
  const licence = catalog.specByKey.get('licence')
  if (licence?.filterable && keys.has('licence')) {
    const cur = state.specs.licence
    presets.push({
      id: 'licence-b',
      label: labels.licenceB,
      active: Array.isArray(cur) && cur.length === 1 && cur[0] === 'B',
      toggle: (s, on) => {
        if (on) s.specs.licence = ['B']
        else delete s.specs.licence
      },
    })
  }
  for (const spec of catalog.specs) {
    if (!spec.quickFilter || !spec.filterable || !keys.has(spec.key)) continue
    const qf = spec.quickFilter
    if (spec.dataType === 'number' && qf.min != null) {
      const cur = state.specs[spec.key]
      presets.push({
        id: spec.key,
        label: qf.label,
        active: Boolean(cur && !Array.isArray(cur) && cur !== true && cur.min === qf.min && cur.max == null),
        toggle: (s, on) => {
          if (on) s.specs[spec.key] = { min: qf.min! }
          else delete s.specs[spec.key]
        },
      })
    } else if (spec.dataType === 'boolean' || spec.dataType === 'feature') {
      presets.push({
        id: spec.key,
        label: qf.label,
        active: state.specs[spec.key] === true,
        toggle: (s, on) => {
          if (on) s.specs[spec.key] = true
          else delete s.specs[spec.key]
        },
      })
    }
  }

  const out: QuickChip[] = []
  for (const p of presets) {
    const next = clone(state)
    p.toggle(next, !p.active)
    const count = p.active ? current.length : applyFilters(scope, next, catalog).length
    if (!p.active && (count === 0 || count === current.length)) continue
    out.push({ id: p.id, label: p.label, active: p.active, count, state: next })
  }
  return out.slice(0, max)
}
