/**
 * Structured data (docs/03 §4), typed with schema-dts. Never marks up reviews or ratings.
 *
 * Vehicle pages: `Product` (+ `Vehicle` for road vehicles) with `additionalProperty` for every spec and an
 * `Offer` only when a net list price is published. Without a price we use `ProductModel` (a schema.org
 * Product subtype meaning "a vendor specification of a product"): Google's product snippet requires
 * offers, reviews or ratings, so plain `Product` without a price would show as an error in Search
 * Console. Switch with PRODUCT_TYPE_WITHOUT_PRICE if the Rich Results Test says otherwise.
 */
import type {
  AboutPage,
  Article,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  ItemList,
  ItemPage,
  Organization,
  PropertyValue,
  Thing,
  WebSite,
  WithContext,
} from 'schema-dts'

import type { Locale } from '../../i18n/config'
import type { Catalog } from '../catalog/catalog'
import { formatSpec, type ValueLabels } from '../catalog/format'
import type { Faq, Listing, SiteSettings } from '../catalog/types'
import { SITE_NAME, SITE_URL } from '../env'
import { absolute } from '../urls'

export const PRODUCT_TYPE_WITHOUT_PRICE = 'ProductModel' as const

const ROAD_CLASSES = new Set(['L', 'N1', 'N2', 'N3', 'M2', 'M3'])

type Json = Record<string, unknown>

export const websiteId = `${SITE_URL}/#website`
export const organizationId = `${SITE_URL}/#organization`

export function websiteLd(locale: Locale, searchPath: string): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    publisher: { '@id': organizationId },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${absolute(searchPath)}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    } as never,
  }
}

export function organizationLd(settings: SiteSettings): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: SITE_NAME,
    legalName: settings.organization.legalName ?? undefined,
    url: SITE_URL,
    logo: settings.organization.logoUrl ? absolute(settings.organization.logoUrl) : `${SITE_URL}/icon.svg`,
    ...(settings.organization.sameAs.length ? { sameAs: settings.organization.sameAs } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.owner.name
      ? { founder: { '@type': 'Person', name: settings.owner.name, ...(settings.owner.url ? { url: settings.owner.url } : {}) } }
      : {}),
  }
}

export function breadcrumbLd(items: { name: string; path?: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: absolute(c.path) } : {}),
    })),
  }
}

export function faqLd(faqs: Faq[]): WithContext<FAQPage> | null {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function itemListLd(items: { url: string; name: string }[]): ItemList {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(it.url), name: it.name })),
  }
}

export function collectionPageLd(args: {
  name: string
  description: string
  path: string
  locale: Locale
  items: { url: string; name: string }[]
  dateModified?: string | null
}): WithContext<CollectionPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: absolute(args.path),
    inLanguage: args.locale,
    isPartOf: { '@id': websiteId },
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
    mainEntity: itemListLd(args.items),
  }
}

function quantity(value: unknown, unitCode: string | null) {
  return typeof value === 'number' ? { '@type': 'QuantitativeValue', value, ...(unitCode ? { unitCode } : {}) } : undefined
}

/** Product / ProductModel (+ Vehicle) for a listing, plus the ItemPage that carries dates and provenance. */
export function vehicleLd(args: {
  listing: Listing
  catalog: Catalog
  locale: Locale
  path: string
  brandPath: string
  imageUrls: string[]
  labels: ValueLabels
  netPriceNote: string
}): Json[] {
  const { listing, catalog, locale, path, labels } = args
  const brand = catalog.brandOf(listing)
  const type = catalog.typeOf(listing)
  const group = catalog.groupOf(type)
  const url = absolute(path)
  const id = `${url}#product`
  const price = listing.specs.price_eur
  const road = ROAD_CLASSES.has(String(listing.specs.eu_class ?? ''))
  const baseType = typeof price === 'number' ? 'Product' : PRODUCT_TYPE_WITHOUT_PRICE
  const specs = catalog.profileSpecs(listing)

  const additionalProperty: PropertyValue[] = []
  for (const spec of specs) {
    const value = listing.specs[spec.key]
    if (value == null || spec.key === 'price_eur') continue
    const text = formatSpec(spec, value, locale, labels)
    if (!text) continue
    additionalProperty.push({
      '@type': 'PropertyValue',
      propertyID: spec.key,
      name: spec.label,
      value: typeof value === 'number' ? value : text,
      ...(typeof value === 'number' && spec.unitCode && spec.unit !== '€' ? { unitCode: spec.unitCode } : {}),
      ...(typeof value === 'number' && spec.unit && spec.unit !== '€' ? { unitText: spec.unit } : {}),
    })
  }

  const product: Json = {
    '@context': 'https://schema.org',
    '@type': road ? [baseType, 'Vehicle'] : baseType,
    '@id': id,
    name: listing.title,
    model: listing.model,
    brand: { '@type': 'Brand', name: brand.name, url: absolute(args.brandPath) },
    manufacturer: { '@type': 'Organization', name: brand.name, ...(brand.website ? { url: brand.website } : {}) },
    category: group.id !== type.id ? `${group.name} > ${type.name}` : type.name,
    description: listing.summary,
    url,
    ...(args.imageUrls.length ? { image: args.imageUrls.map(absolute) } : {}),
    additionalProperty,
  }
  if (road) {
    Object.assign(product, {
      fuelType: 'Electricity',
      ...(quantity(listing.specs.payload_kg, 'KGM') ? { payload: quantity(listing.specs.payload_kg, 'KGM') } : {}),
      ...(quantity(listing.specs.cargo_m3, 'MTQ') ? { cargoVolume: quantity(listing.specs.cargo_m3, 'MTQ') } : {}),
      ...(quantity(listing.specs.gvw_t, 'TNE') ? { weightTotal: quantity(listing.specs.gvw_t, 'TNE') } : {}),
      ...(quantity(listing.specs.top_speed_kmh, 'KMH') ? { speed: quantity(listing.specs.top_speed_kmh, 'KMH') } : {}),
      ...(typeof listing.specs.passengers === 'number'
        ? { seatingCapacity: listing.specs.passengers }
        : typeof listing.specs.seats === 'number'
          ? { seatingCapacity: listing.specs.seats }
          : {}),
      ...(typeof listing.specs.power_kw === 'number'
        ? { vehicleEngine: { '@type': 'EngineSpecification', enginePower: quantity(listing.specs.power_kw, 'KWT') } }
        : {}),
    })
  }
  if (typeof price === 'number') {
    product.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: 'EUR',
      description: args.netPriceNote,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'EUR',
        valueAddedTaxIncluded: false,
      },
      availability:
        listing.availability === 'on-sale'
          ? 'https://schema.org/InStock'
          : listing.availability === 'discontinued'
            ? 'https://schema.org/Discontinued'
            : 'https://schema.org/PreOrder',
      url,
      seller: { '@type': 'Organization', name: brand.name },
    }
  }

  const page: WithContext<ItemPage> = {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    url,
    name: listing.title,
    inLanguage: locale,
    isPartOf: { '@id': websiteId },
    dateModified: listing.updatedAt,
    datePublished: listing.createdAt,
    mainEntity: { '@id': id } as Thing,
    ...(catalog.isVerified(listing)
      ? { reviewedBy: { '@type': 'Organization', name: brand.name }, lastReviewed: listing.verifiedAt ?? undefined }
      : {}),
  }
  return [product, page as unknown as Json]
}

export function articleLd(args: {
  title: string
  description: string
  path: string
  locale: Locale
  author: string
  datePublished?: string | null
  dateModified: string
  image?: string | null
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    url: absolute(args.path),
    mainEntityOfPage: absolute(args.path),
    inLanguage: args.locale,
    author: { '@type': 'Person', name: args.author },
    publisher: { '@id': organizationId },
    ...(args.datePublished ? { datePublished: args.datePublished } : {}),
    dateModified: args.dateModified,
    ...(args.image ? { image: absolute(args.image) } : {}),
  }
}

export function aboutPageLd(args: { name: string; path: string; locale: Locale }): WithContext<AboutPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: args.name,
    url: absolute(args.path),
    inLanguage: args.locale,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
  }
}
