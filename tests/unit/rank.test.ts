import { describe, expect, it } from 'vitest'

import { isSponsoredPosition, similarListings, sortListings, sortOptions } from '@/lib/catalog/rank'

import { makeCatalog } from '../fixtures/catalog'

const c = makeCatalog()
const slugs = (list: { slug: string }[]) => list.map((l) => l.slug)

describe('sortListings', () => {
  it('Recommended: paid boost first (Pro > Starter > none), then availability and completeness', () => {
    const order = slugs(sortListings(c.listings, 'recommended', c))
    expect(order.slice(0, 3)).toEqual(['kia-pv5-cargo-long-range', 'kia-pv5-cargo-standard-range', 'mercedes-benz-eeconic'])
    // Unpaid: on sale before orders open before announced.
    expect(order.slice(3)).toEqual(['ford-e-transit-courier', 'volvo-ce-ecr25-electric', 'ford-heavy'])
  })

  it('labels only positions influenced by payment', () => {
    const kia = c.listingById.get(1)!
    const ford = c.listingById.get(3)!
    expect(isSponsoredPosition(kia, 'recommended', c)).toBe(true)
    expect(isSponsoredPosition(ford, 'recommended', c)).toBe(false)
    expect(isSponsoredPosition(kia, 'range-desc', c)).toBe(false)
  })

  it('explicit spec sorts ignore payment and put missing values last', () => {
    const order = slugs(sortListings(c.listings, 'range-desc', c))
    expect(order).toEqual([
      'kia-pv5-cargo-long-range',
      'ford-heavy',
      'kia-pv5-cargo-standard-range',
      'ford-e-transit-courier',
      'mercedes-benz-eeconic',
      'volvo-ce-ecr25-electric',
    ])
    expect(slugs(sortListings(c.listings, 'price-asc', c))[0]).toBe('ford-e-transit-courier')
  })

  it('sorts by name and by last update', () => {
    expect(slugs(sortListings(c.listings, 'name', c)).slice(0, 2)).toEqual(['ford-e-transit-courier', 'ford-heavy'])
    expect(slugs(sortListings(c.listings, 'updated', c))[0]).toBe('ford-e-transit-courier')
  })

  it('ranks search relevance after the boost', () => {
    const order = slugs(sortListings(c.listings, 'recommended', c, 'ford'))
    // Kia and Mercedes-Benz stay boosted; relevance decides among the rest.
    expect(order.indexOf('ford-e-transit-courier')).toBeLessThan(order.indexOf('volvo-ce-ecr25-electric'))
  })
})

describe('sortOptions', () => {
  it('offers numeric specs with a direction that at least two listings have', () => {
    const vans = c.listingsForType(c.typeBySlug.get('vans')!)
    const values = sortOptions(vans, c).map((o) => o.value)
    expect(values).toEqual(['recommended', 'name', 'battery-desc', 'range-desc', 'dc-desc', 'payload-desc', 'updated'])
    // Only one van has a price; the option appears when it is the current sort.
    expect(sortOptions(vans, c, 'price-asc').map((o) => o.value)).toContain('price-asc')
  })
})

describe('similarListings', () => {
  it('picks the closest vehicles of the same group, excluding other versions of the same model', () => {
    const kia = c.listingById.get(1)!
    expect(slugs(similarListings(kia, c))).toEqual(['ford-e-transit-courier'])
  })

  it('never crosses groups', () => {
    const volvo = c.listingById.get(5)!
    expect(similarListings(volvo, c)).toEqual([])
  })
})
