import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'

import messages from '../../messages/en.json'
import { factSentences } from '@/lib/catalog/sentences'
import { breadcrumbLd, collectionPageLd, faqLd, vehicleLd } from '@/lib/seo/jsonld'
import { DESCRIPTION_MAX, TITLE_MAX, buildMetadata, fitTitle, fitTitleCandidates, truncate } from '@/lib/seo/metadata'

import { makeCatalog } from '../fixtures/catalog'

const c = makeCatalog()
const labels = { yes: 'Yes', no: 'No', std: 'Standard', opt: 'Optional', notAvailable: 'Not available' }

describe('titles and descriptions', () => {
  it('adds the site suffix only when it fits', () => {
    expect(fitTitle('Kia PV5 Cargo')).toBe('Kia PV5 Cargo | ECV Base')
    const long = 'Mercedes-Benz eActros 600 Long Haul: range, battery, payload & price'
    const t = fitTitle(long)
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX)
    expect(t.endsWith('…')).toBe(true)
  })

  it('picks the longest candidate that fits', () => {
    const t = fitTitleCandidates([
      'Kia PV5 Cargo Long Range: range, battery, payload & DC charging',
      'Kia PV5 Cargo Long Range: range, battery & payload',
      'Kia PV5 Cargo Long Range: range & battery',
      'Kia PV5 Cargo Long Range',
    ])
    expect(t).toBe('Kia PV5 Cargo Long Range: range & battery | ECV Base')
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX)
  })

  it('truncates descriptions at a word boundary', () => {
    const d = truncate('word '.repeat(60))
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(d.endsWith('word…')).toBe(true)
    expect(truncate('Short.')).toBe('Short.')
  })

  it('builds canonical, hreflang with x-default, and robots', () => {
    const m = buildMetadata({
      locale: 'en',
      title: 'T',
      description: 'D',
      path: '/en/vehicles',
      alternates: { en: '/en/vehicles', de: '/de/fahrzeuge' },
    })
    expect(m.alternates?.canonical).toBe('http://localhost:3000/en/vehicles')
    expect(m.alternates?.languages).toEqual({
      en: 'http://localhost:3000/en/vehicles',
      de: 'http://localhost:3000/de/fahrzeuge',
      'x-default': 'http://localhost:3000/en/vehicles',
    })
    expect(m.robots).toMatchObject({ index: true, follow: true })
  })

  it('faceted pages are noindex,follow with a canonical to the hub and no hreflang', () => {
    const m = buildMetadata({
      locale: 'en',
      title: 'T',
      description: 'D',
      path: '/en/types/vans?range_min=300',
      canonicalPath: '/en/types/vans',
      noindex: true,
    })
    expect(m.alternates?.canonical).toBe('http://localhost:3000/en/types/vans')
    expect(m.alternates?.languages).toBeUndefined()
    expect(m.robots).toEqual({ index: false, follow: true })
  })
})

describe('JSON-LD', () => {
  const ld = (id: number) =>
    vehicleLd({
      listing: c.listingById.get(id)!,
      catalog: c,
      locale: 'en',
      path: `/en/vehicles/${c.listingById.get(id)!.slug}`,
      brandPath: '/en/brands/x',
      imageUrls: ['/media/a.webp'],
      labels,
      netPriceNote: 'Net list price',
    })

  it('adds an Offer only when a price is published', () => {
    const [priced] = ld(3)
    expect(priced['@type']).toBe('Product')
    expect(priced.offers).toMatchObject({ '@type': 'Offer', price: 29990, priceCurrency: 'EUR' })

    const [unpriced] = ld(2)
    expect(unpriced['@type']).toBe('ProductModel')
    expect(unpriced.offers).toBeUndefined()
  })

  it('describes every spec as a PropertyValue with units', () => {
    const [product] = ld(1)
    const props = product.additionalProperty as { propertyID: string; value: unknown; unitCode?: string }[]
    expect(props.find((p) => p.propertyID === 'battery_kwh')).toMatchObject({ value: 71.2, unitCode: 'KWH' })
    expect(props.find((p) => p.propertyID === 'charging')).toMatchObject({ value: 'CCS2, Type 2 AC' })
    expect(props.some((p) => p.propertyID === 'price_eur')).toBe(false)
    expect(product).toMatchObject({ name: 'Kia PV5 Cargo Long Range', brand: { '@type': 'Brand', name: 'Kia' } })
  })

  it('marks road vehicles as Vehicle and machines as plain products', () => {
    expect(ld(1)[0]['@type']).toEqual(['ProductModel', 'Vehicle'])
    expect(ld(5)[0]['@type']).toBe('ProductModel')
  })

  it('never includes reviews or ratings', () => {
    for (const l of c.listings) {
      const json = JSON.stringify(ld(l.id))
      expect(json).not.toMatch(/aggregateRating|"review"/)
    }
  })

  it('credits the manufacturer confirmation on the ItemPage', () => {
    const [, page] = ld(1)
    expect(page).toMatchObject({ '@type': 'ItemPage', lastReviewed: '2026-09-12', reviewedBy: { name: 'Kia' } })
    expect(ld(3)[1].reviewedBy).toBeUndefined()
  })

  it('builds breadcrumbs, collection pages and FAQs', () => {
    const b = breadcrumbLd([{ name: 'Home', path: '/en' }, { name: 'Vans' }])
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'http://localhost:3000/en' },
      { '@type': 'ListItem', position: 2, name: 'Vans' },
    ])
    const cp = collectionPageLd({ name: 'Vans', description: 'd', path: '/en/types/vans', locale: 'en', items: [{ url: '/en/vehicles/a', name: 'A' }] })
    expect(cp.mainEntity).toMatchObject({ '@type': 'ItemList', numberOfItems: 1 })
    expect(faqLd([])).toBeNull()
    expect(faqLd([{ question: 'Q?', answer: 'A.' }])?.mainEntity).toHaveLength(1)
  })

  it('serialises to valid JSON', () => {
    for (const l of c.listings) expect(() => JSON.parse(JSON.stringify(ld(l.id)))).not.toThrow()
  })
})

describe('fact sentences', () => {
  const t = createTranslator({ locale: 'en', messages, namespace: 'facts' })
  const tr = (k: string, v?: Record<string, string | number>) => t(k as never, v as never)
  const has = (k: string) => t.has(k as never)

  it('writes citable sentences from the data', () => {
    const s = factSentences(c.listingById.get(1)!, c, 'en', tr, has, labels)
    expect(s).toEqual([
      'The Kia PV5 Cargo Long Range (small vans) has a range of up to 416 km, a 71.2 kWh usable battery, a payload of up to 690 kg and DC charging at up to 150 kW.',
      'It is on sale in Europe; the price is available on request.',
      'The data was confirmed by Kia on 12 September 2026.',
    ])
  })

  it('mentions a published price and the compilation date for unconfirmed listings', () => {
    const s = factSentences(c.listingById.get(3)!, c, 'en', tr, has, labels)
    expect(s[1]).toBe('It is on sale in Europe, with list prices from €29,990 net.')
    expect(s[2]).toBe('Specifications are compiled from public manufacturer sources; last updated 25 September 2026.')
  })
})
