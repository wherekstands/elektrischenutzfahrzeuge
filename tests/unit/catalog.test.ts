import { describe, expect, it } from 'vitest'

import { Catalog } from '@/lib/catalog/catalog'

import { NOW, makeCatalog } from '../fixtures/catalog'

describe('Catalog: taxonomy', () => {
  const c = makeCatalog()

  it('lists groups and areas as top-level nodes', () => {
    expect(c.groups.map((g) => g.slug)).toEqual(['vans', 'municipal', 'trucks', 'construction'])
    expect(c.areas.map((a) => a.slug)).toEqual(['logistics', 'municipal-services'])
  })

  it('includes cross-listed types in a group scope', () => {
    const trucks = c.typeBySlug.get('trucks')!
    expect(c.typesInGroup(trucks).map((t) => t.slug)).toEqual(['heavy-trucks', 'refuse-trucks'])
    expect([...c.typeScope(trucks)].sort()).toEqual([4, 6])
    expect(c.listingsForType(trucks).map((l) => l.slug).sort()).toEqual(['ford-heavy', 'mercedes-benz-eeconic'])
  })

  it('keeps a leaf type scope to itself', () => {
    expect([...c.typeScope(c.typeBySlug.get('refuse-trucks')!)]).toEqual([4])
  })

  it('scopes an area to its jobs', () => {
    const area = c.jobBySlug.get('municipal-services')!
    expect(c.listingsForJob(area).map((l) => l.id).sort()).toEqual([4, 6])
  })

  it('resolves canonical type paths, with and without a job', () => {
    expect(c.resolveTypePath(['vans'], 'for')?.type.slug).toBe('vans')
    expect(c.resolveTypePath(['vans', 'small-vans'], 'for')?.type.slug).toBe('small-vans')
    const combo = c.resolveTypePath(['trucks', 'for', 'waste-collection'], 'for')
    expect(combo?.type.slug).toBe('trucks')
    expect(combo?.job?.slug).toBe('waste-collection')
    expect(c.landingFor(combo!.type, combo!.job!)?.title).toBe('Electric trucks for waste collection')
  })

  it('rejects non-canonical type paths', () => {
    expect(c.resolveTypePath(['small-vans'], 'for')).toBeNull() // missing group segment
    expect(c.resolveTypePath(['trucks', 'small-vans'], 'for')).toBeNull() // wrong group
    expect(c.resolveTypePath(['vans', 'for'], 'for')).toBeNull() // missing job
    expect(c.resolveTypePath(['vans', 'for', 'nope'], 'for')).toBeNull()
    expect(c.resolveTypePath(['vans', 'small-vans', 'x'], 'for')).toBeNull()
  })

  it('resolves job paths only in canonical form', () => {
    expect(c.resolveJobPath(['logistics', 'last-mile-delivery'])?.slug).toBe('last-mile-delivery')
    expect(c.resolveJobPath(['last-mile-delivery'])).toBeNull()
    expect(c.resolveJobPath([])).toBeNull()
  })

  it('drops nodes and listings without content in this locale', () => {
    const data = makeCatalog().data
    data.types.find((t) => t.slug === 'mini-excavators')!.hasLocale = false
    data.listings.find((l) => l.id === 2)!.hasLocale = false
    const partial = new Catalog(data, NOW)
    expect(partial.typeBySlug.has('mini-excavators')).toBe(false)
    expect(partial.listingById.has(5)).toBe(false) // its type is not published in this locale
    expect(partial.listingById.has(2)).toBe(false)
  })
})

describe('Catalog: what a partnership unlocks', () => {
  const c = makeCatalog()
  const kia = c.listingById.get(1)!
  const kiaStandard = c.listingById.get(2)!
  const ford = c.listingById.get(3)!
  const mb = c.listingById.get(4)!

  it('shows the "confirmed by" badge only for active partners within 12 months', () => {
    expect(c.isVerified(kia)).toBe(true)
    expect(c.isVerified(kiaStandard)).toBe(false) // never confirmed
    expect(makeCatalog(new Date('2027-09-13T12:00:00Z')).isVerified(kia)).toBe(false) // expired
    expect(makeCatalog(new Date('2026-09-01T00:00:00Z')).isVerified(kia)).toBe(false) // confirmed in the future
  })

  it('never verifies a listing whose brand is not an active partner', () => {
    const data = makeCatalog().data
    data.brands[0].partnerActive = false
    const lapsed = new Catalog(data, NOW)
    const l = lapsed.listingById.get(1)!
    expect(lapsed.isVerified(l)).toBe(false)
    expect(lapsed.showContact(l)).toBe(false)
    expect(lapsed.showBenefits(l)).toBe(false)
    expect(lapsed.showDocuments(l)).toBe(false)
  })

  it('shows the named contact for Starter and Pro only', () => {
    expect(c.showContact(kia)).toBe(true)
    expect(c.showContact(mb)).toBe(true)
    expect(c.showContact(ford)).toBe(false)
  })

  it('shows key benefits for Pro only', () => {
    expect(c.showBenefits(kia)).toBe(true)
    expect(c.showBenefits(kiaStandard)).toBe(false) // Pro, but no benefits entered
    const data = makeCatalog().data
    data.listings.find((l) => l.id === 4)!.keyBenefits = ['A', 'B', 'C']
    const starter = new Catalog(data, NOW)
    expect(starter.showBenefits(starter.listingById.get(4)!)).toBe(false)
  })

  it('shows documents for paying partners with documents', () => {
    expect(c.showDocuments(kia)).toBe(true)
    expect(c.showDocuments(kiaStandard)).toBe(false)
  })
})

describe('Catalog: listings', () => {
  const c = makeCatalog()

  it('computes completeness with key figures weighted double', () => {
    const vol = c.listingById.get(5)!
    // universal (7) + runtime + weight = 9 rows; key figures (weight, runtime, battery) count double → 12
    // filled: battery(2) licence(1) eu_class(1) runtime(2) weight(2) = 8
    expect(c.completeness(vol)).toBeCloseTo(8 / 12)
  })

  it('finds other versions of the same model', () => {
    expect(c.versionsOf(c.listingById.get(1)!).map((l) => l.id)).toEqual([2])
    expect(c.versionsOf(c.listingById.get(3)!)).toEqual([])
  })

  it('returns key figure specs in type order', () => {
    expect(c.keyFigureSpecs(c.listingById.get(1)!).map((s) => s.key)).toEqual([
      'range_km',
      'battery_kwh',
      'payload_kg',
      'dc_kw',
    ])
  })

  it('reports brands with listings and the latest update', () => {
    expect(c.activeBrands.map((b) => b.slug)).toEqual(['kia', 'ford', 'mercedes-benz', 'volvo-ce'])
    expect(c.latestUpdate()).toBe('2026-09-25T10:00:00.000Z')
  })
})

describe('Catalog: paid placements', () => {
  const c = makeCatalog()

  it('only features listings of active partners', () => {
    expect(c.featuredListings({ home: true }).map((l) => l.id)).toEqual([1])
  })

  it('features on type hubs including the group hub and its leaf types', () => {
    expect(c.featuredListings({ type: c.typeBySlug.get('vans')! }).map((l) => l.id)).toEqual([1])
    expect(c.featuredListings({ type: c.typeBySlug.get('small-vans')! }).map((l) => l.id)).toEqual([1])
    expect(c.featuredListings({ type: c.typeBySlug.get('trucks')! })).toEqual([])
  })

  it('never features more than two listings', () => {
    const data = makeCatalog().data
    data.placements = [
      { id: 9, kind: 'featured-listing', brandId: 1, listingIds: [1, 2], onHome: true, onBrandHub: false, onGuides: false, typeIds: [], jobIds: [], priority: 1 },
      { id: 10, kind: 'featured-listing', brandId: 3, listingIds: [4], onHome: true, onBrandHub: false, onGuides: false, typeIds: [], jobIds: [], priority: 2 },
    ]
    expect(new Catalog(data, NOW).featuredListings({ home: true }).map((l) => l.id)).toEqual([1, 2])
  })
})
