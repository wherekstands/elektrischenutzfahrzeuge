import { describe, expect, it } from 'vitest'

import {
  activeFilterCount,
  applyFilters,
  computeFacets,
  emptyFilters,
  filterParamNames,
  hasFacetParams,
  isValidSort,
  parseFilters,
  quickChips,
  searchScore,
  serializeFilters,
  tokenize,
} from '@/lib/catalog/filters'

import { makeCatalog } from '../fixtures/catalog'

const c = makeCatalog()
const ids = (list: { id: number }[]) => list.map((l) => l.id).sort((a, b) => a - b)

const labels = {
  type: 'Type',
  job: 'Job',
  brand: 'Brand',
  availability: 'Availability',
  availabilityOptions: { 'on-sale': 'On sale', 'orders-open': 'Orders open', announced: 'Announced', discontinued: 'Discontinued' },
}

describe('parseFilters', () => {
  it('reads comma-separated and repeated parameters and ignores unknown values', () => {
    const params = new URLSearchParams('type=small-vans,nope&type=heavy-trucks&brand=kia&brand=unknown&availability=on-sale,sold')
    const s = parseFilters(params, c)
    expect(s.types).toEqual(['small-vans', 'heavy-trucks'])
    expect(s.brands).toEqual(['kia'])
    expect(s.availability).toEqual(['on-sale'])
  })

  it('reads a record of search params (Next.js page props)', () => {
    const s = parseFilters({ q: '  kia ', range_min: '300', range_max: '', ports: ['ccs2,bogus'], v2x: '1', sort: 'range-desc', page: '2' }, c)
    expect(s.q).toBe('kia')
    expect(s.specs).toEqual({ range_km: { min: 300 }, charging: ['ccs2'], v2x: true })
    expect(s.sort).toBe('range-desc')
    expect(s.page).toBe(2)
  })

  it('accepts decimal commas in ranges', () => {
    expect(parseFilters({ battery_min: '71,2' }, c).specs.battery_kwh).toEqual({ min: 71.2 })
  })

  it('falls back to defaults for invalid sort and page', () => {
    const s = parseFilters({ sort: 'licence-asc', page: '-3' }, c)
    expect(s.sort).toBe('recommended')
    expect(s.page).toBe(1)
    expect(isValidSort('price-asc', c)).toBe(true)
    expect(isValidSort('nope-asc', c)).toBe(false)
  })

  it('round-trips through serializeFilters in a stable order', () => {
    const query = 'q=van&type=small-vans&brand=ford%2Ckia&battery_min=40&range_min=250&ports=ccs2&v2x=1&sort=price-asc&page=3'
    const s = parseFilters(new URLSearchParams(query), c)
    expect(serializeFilters(s, c).toString()).toBe(query)
    expect(serializeFilters(emptyFilters(), c).toString()).toBe('')
  })

  it('knows its parameter names', () => {
    const names = filterParamNames(c)
    expect(names.has('range_min')).toBe(true)
    expect(names.has('ports')).toBe(true)
    expect(names.has('utm_source')).toBe(false)
  })

  it('counts active filters without search, sort and page', () => {
    const s = parseFilters({ q: 'x', type: 'small-vans', brand: 'kia,ford', v2x: '1', sort: 'name', page: '2' }, c)
    expect(activeFilterCount(s)).toBe(4)
    expect(hasFacetParams(s)).toBe(true)
    expect(hasFacetParams(emptyFilters())).toBe(false)
  })
})

describe('search', () => {
  it('normalises accents, umlauts and case', () => {
    expect(tokenize('Straßen-Kehrmaschine ÄÖÜ')).toEqual(['strassen', 'kehrmaschine', 'aou'])
  })

  it('ranks brand/model above type synonyms above summary', () => {
    const kia = c.listingById.get(1)!
    const mb = c.listingById.get(4)!
    expect(searchScore(kia, ['kia'], c)).toBe(3)
    expect(searchScore(mb, ['garbage'], c)).toBe(2)
    expect(searchScore(mb, ['summary'], c)).toBe(1)
    expect(searchScore(mb, ['kia'], c)).toBe(0)
  })

  it('requires every token to match', () => {
    const r = applyFilters(c.listings, { ...emptyFilters(), q: 'kia long' }, c)
    expect(ids(r)).toEqual([1])
  })
})

describe('applyFilters', () => {
  const run = (q: string) => ids(applyFilters(c.listings, parseFilters(new URLSearchParams(q), c), c))

  it('filters by group type including cross-listed types', () => {
    expect(run('type=trucks')).toEqual([4, 6])
  })

  it('filters by job area and job', () => {
    expect(run('job=municipal-services')).toEqual([4, 6])
    expect(run('job=last-mile-delivery')).toEqual([1, 2, 3])
  })

  it('filters numeric ranges and excludes listings without the value', () => {
    expect(run('range_min=290')).toEqual([1, 2, 6])
    expect(run('range_min=290&range_max=400')).toEqual([2, 6])
    expect(run('runtime_min=1')).toEqual([5])
  })

  it('matches any selected multiselect option', () => {
    expect(run('ports=type2')).toEqual([1, 3])
    expect(run('licence=C,none')).toEqual([4, 5])
  })

  it('treats standard and optional features as available', () => {
    expect(run('v2x=1')).toEqual([1])
  })

  it('filters confirmed data and published prices', () => {
    expect(run('confirmed=1')).toEqual([1])
    expect(run('priced=1')).toEqual([3])
  })

  it('combines filters with AND', () => {
    expect(run('brand=kia,ford&battery_min=45')).toEqual([1, 2, 6])
    expect(run('brand=kia,ford&battery_min=45&availability=on-sale')).toEqual([1, 2])
  })
})

describe('computeFacets', () => {
  it('counts every facet against all other active filters', () => {
    const scope = c.listings
    const state = parseFilters({ brand: 'kia', range_min: '300' }, c)
    const facets = computeFacets(scope, state, c, { typeOptions: c.groups, jobOptions: null, labels })
    const brand = facets.find((f) => f.key === 'brand')
    expect(brand?.kind).toBe('options')
    if (brand?.kind !== 'options') throw new Error()
    // Brand counts ignore the brand filter but respect range ≥ 300: Kia long range and Ford heavy.
    expect(Object.fromEntries(brand.options.map((o) => [o.value, [o.count, o.selected]]))).toEqual({
      kia: [1, true],
      ford: [1, false],
    })
    // Types ignore the type filter but respect brand and range: only vans remain, so the facet
    // could not narrow anything and is hidden.
    expect(facets.find((f) => f.key === 'type')).toBeUndefined()
    const all = computeFacets(scope, parseFilters({ range_min: '300' }, c), c, { typeOptions: c.groups, jobOptions: null, labels })
    const type = all.find((f) => f.key === 'type')
    if (type?.kind !== 'options') throw new Error('type facet missing')
    expect(type.options.map((o) => [o.value, o.count])).toEqual([
      ['vans', 1],
      ['trucks', 1],
    ])
  })

  it('offers range facets with the domain of the scope', () => {
    const vans = c.listingsForType(c.typeBySlug.get('vans')!)
    const facets = computeFacets(vans, emptyFilters(), c, { typeOptions: null, jobOptions: null, labels })
    const range = facets.find((f) => f.key === 'spec:range_km')
    expect(range?.kind === 'range' && range.domain).toEqual({ min: 288, max: 416 })
    // Specs that are not part of the vans profile never show up.
    expect(facets.some((f) => f.key === 'spec:runtime_h')).toBe(false)
  })
})

describe('quickChips', () => {
  const chipLabels = { onSale: 'On sale', confirmed: 'Confirmed', priced: 'Price', licenceB: 'Licence B' }

  it('only offers chips that change the result', () => {
    const vans = c.listingsForType(c.typeBySlug.get('vans')!)
    const chips = quickChips(vans, emptyFilters(), c, chipLabels)
    const byId = Object.fromEntries(chips.map((ch) => [ch.id, ch.count]))
    expect(byId).toEqual({ confirmed: 1, priced: 1, range_km: 1, v2x: 1 })
    // All vans are on sale and need licence B → those chips would not change anything.
    expect(byId['on-sale']).toBeUndefined()
    expect(byId['licence-b']).toBeUndefined()
  })

  it('marks active chips and toggles them off', () => {
    const state = parseFilters({ range_min: '300' }, c)
    const vans = c.listingsForType(c.typeBySlug.get('vans')!)
    const chip = quickChips(vans, state, c, chipLabels).find((ch) => ch.id === 'range_km')!
    expect(chip.active).toBe(true)
    expect(chip.state.specs.range_km).toBeUndefined()
  })
})
