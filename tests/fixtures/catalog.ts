/** A small but realistic catalogue for unit tests (no database). */
import { Catalog } from '@/lib/catalog/catalog'
import type { Brand, CatalogData, JobNode, Listing, SpecDef, TypeNode } from '@/lib/catalog/types'

const spec = (s: Partial<SpecDef> & Pick<SpecDef, 'id' | 'key' | 'urlKey' | 'label' | 'dataType' | 'group' | 'order'>): SpecDef => ({
  shortLabel: s.label,
  help: null,
  unit: null,
  unitCode: null,
  decimals: null,
  universal: false,
  filterable: true,
  showInCompare: true,
  better: null,
  options: [],
  quickFilter: null,
  ...s,
})

export const specs: SpecDef[] = [
  spec({ id: 1, key: 'battery_kwh', urlKey: 'battery', label: 'Battery capacity (usable)', shortLabel: 'Battery', dataType: 'number', unit: 'kWh', unitCode: 'KWH', decimals: 1, group: 'energy', order: 20, universal: true, better: 'high' }),
  spec({ id: 2, key: 'range_km', urlKey: 'range', label: 'Range', dataType: 'number', unit: 'km', unitCode: 'KMT', group: 'energy', order: 30, better: 'high', quickFilter: { min: 300, label: 'Range 300 km+' } }),
  spec({ id: 3, key: 'runtime_h', urlKey: 'runtime', label: 'Runtime', dataType: 'number', unit: 'h', unitCode: 'HUR', group: 'energy', order: 40, better: 'high' }),
  spec({ id: 4, key: 'dc_kw', urlKey: 'dc', label: 'DC charging power (max)', shortLabel: 'DC charging', dataType: 'number', unit: 'kW', unitCode: 'KWT', group: 'charging', order: 10, universal: true, better: 'high' }),
  spec({ id: 5, key: 'charging', urlKey: 'ports', label: 'Charging interfaces', dataType: 'multiselect', group: 'charging', order: 30, universal: true, options: [{ value: 'ccs2', label: 'CCS2' }, { value: 'type2', label: 'Type 2 AC' }, { value: 'mcs', label: 'MCS' }] }),
  spec({ id: 6, key: 'v2x', urlKey: 'v2x', label: 'Bidirectional charging', shortLabel: 'V2L / V2G', dataType: 'feature', group: 'charging', order: 50, universal: true, quickFilter: { min: null, label: 'V2L / V2G' } }),
  spec({ id: 7, key: 'payload_kg', urlKey: 'payload', label: 'Payload (max)', shortLabel: 'Payload', dataType: 'number', unit: 'kg', unitCode: 'KGM', group: 'capacity', order: 10, better: 'high' }),
  spec({ id: 8, key: 'op_weight_kg', urlKey: 'weight', label: 'Operating weight', dataType: 'number', unit: 'kg', unitCode: 'KGM', group: 'dimensions', order: 30 }),
  spec({ id: 9, key: 'licence', urlKey: 'licence', label: 'Driving licence', dataType: 'select', group: 'operation', order: 20, universal: true, options: [{ value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'none', label: 'Not road-registered' }] }),
  spec({ id: 10, key: 'eu_class', urlKey: 'class', label: 'EU vehicle class', dataType: 'select', group: 'operation', order: 10, universal: true, options: [{ value: 'N1', label: 'N1' }, { value: 'SPM', label: 'Self-propelled machine' }] }),
  spec({ id: 11, key: 'price_eur', urlKey: 'price', label: 'List price from (net)', shortLabel: 'Price', dataType: 'number', unit: '€', unitCode: 'EUR', group: 'commercial', order: 10, universal: true, better: 'low' }),
]

const universal = specs.filter((s) => s.universal).map((s) => s.key)

const node = (n: Partial<TypeNode> & Pick<TypeNode, 'id' | 'slug' | 'name' | 'path'>): TypeNode => ({
  kind: 'type',
  shortDescription: null,
  parentId: null,
  order: n.id,
  illustration: 'van',
  intro: null,
  faqs: [],
  synonyms: [],
  seo: {},
  childIds: [],
  hasLocale: true,
  alsoListedIn: [],
  specKeys: universal,
  keyFigures: [],
  ...n,
})

export const types: TypeNode[] = [
  node({ id: 1, slug: 'vans', name: 'Vans', path: ['vans'], childIds: [2], specKeys: [...universal, 'range_km', 'payload_kg'], keyFigures: ['range_km', 'battery_kwh', 'payload_kg', 'dc_kw'] }),
  node({ id: 2, slug: 'small-vans', name: 'Small vans', parentId: 1, path: ['vans', 'small-vans'], specKeys: [...universal, 'range_km', 'payload_kg'], keyFigures: ['range_km', 'battery_kwh', 'payload_kg', 'dc_kw'], synonyms: ['city van'] }),
  node({ id: 3, slug: 'municipal', name: 'Municipal vehicles', path: ['municipal'], childIds: [4], illustration: 'sweeper' }),
  node({ id: 4, slug: 'refuse-trucks', name: 'Refuse collection trucks', parentId: 3, path: ['municipal', 'refuse-trucks'], alsoListedIn: [5], specKeys: [...universal, 'range_km'], keyFigures: ['battery_kwh', 'range_km'], synonyms: ['garbage truck', 'RCV'] }),
  node({ id: 5, slug: 'trucks', name: 'Trucks', path: ['trucks'], childIds: [6], illustration: 'truck' }),
  node({ id: 6, slug: 'heavy-trucks', name: 'Heavy rigid trucks', parentId: 5, path: ['trucks', 'heavy-trucks'], specKeys: [...universal, 'range_km', 'payload_kg'], keyFigures: ['range_km', 'battery_kwh'] }),
  node({ id: 7, slug: 'construction', name: 'Construction machinery', path: ['construction'], childIds: [8], illustration: 'excavator' }),
  node({ id: 8, slug: 'mini-excavators', name: 'Mini excavators', parentId: 7, path: ['construction', 'mini-excavators'], specKeys: [...universal, 'runtime_h', 'op_weight_kg'], keyFigures: ['op_weight_kg', 'runtime_h', 'battery_kwh'] }),
]

const job = (j: Partial<JobNode> & Pick<JobNode, 'id' | 'slug' | 'name' | 'path'>): JobNode => ({
  kind: 'job',
  shortDescription: null,
  parentId: null,
  order: j.id,
  illustration: null,
  intro: null,
  faqs: [],
  synonyms: [],
  seo: {},
  childIds: [],
  hasLocale: true,
  typicalTypeIds: [],
  ...j,
})

export const jobs: JobNode[] = [
  job({ id: 1, slug: 'logistics', name: 'Logistics & delivery', path: ['logistics'], childIds: [2] }),
  job({ id: 2, slug: 'last-mile-delivery', name: 'Last-mile & parcel delivery', parentId: 1, path: ['logistics', 'last-mile-delivery'] }),
  job({ id: 3, slug: 'municipal-services', name: 'Municipal & public services', path: ['municipal-services'], childIds: [4] }),
  job({ id: 4, slug: 'waste-collection', name: 'Waste collection & recycling', parentId: 3, path: ['municipal-services', 'waste-collection'] }),
]

const brand = (b: Partial<Brand> & Pick<Brand, 'id' | 'name' | 'slug'>): Brand => ({
  logo: null,
  country: null,
  website: null,
  description: null,
  tagline: null,
  contact: null,
  tier: 'free',
  partnerActive: false,
  boost: 0,
  highlight: false,
  demo: false,
  ...b,
})

export const brands: Brand[] = [
  brand({ id: 1, name: 'Kia', slug: 'kia', tier: 'pro', partnerActive: true, boost: 2, highlight: true, contact: { name: 'Laura Demo', role: 'Fleet sales', email: 'laura@kia.example', phone: null, region: 'DE' } }),
  brand({ id: 2, name: 'Ford', slug: 'ford' }),
  brand({ id: 3, name: 'Mercedes-Benz', slug: 'mercedes-benz', tier: 'starter', partnerActive: true, boost: 1, contact: { name: null, role: null, email: 'fleet@mb.example', phone: null, region: null } }),
  brand({ id: 4, name: 'Volvo CE', slug: 'volvo-ce' }),
]

const listing = (l: Partial<Listing> & Pick<Listing, 'id' | 'slug' | 'brandId' | 'model' | 'typeId'>): Listing => ({
  family: null,
  title: `${brands.find((b) => b.id === l.brandId)!.name} ${l.model}`,
  jobIds: [],
  availability: 'on-sale',
  summary: `${l.model} summary`,
  specs: {},
  keyFacts: ['Fact one', 'Fact two', 'Fact three'],
  keyBenefits: [],
  images: [],
  documents: [],
  sourceUrl: null,
  sources: [],
  verifiedAt: null,
  updatedAt: '2026-09-20T10:00:00.000Z',
  createdAt: '2026-09-01T10:00:00.000Z',
  seo: {},
  demo: false,
  hasLocale: true,
  ...l,
})

export const NOW = new Date('2026-09-26T12:00:00Z')

export const listings: Listing[] = [
  listing({ id: 1, slug: 'kia-pv5-cargo-long-range', brandId: 1, model: 'PV5 Cargo Long Range', family: 'PV5 Cargo', typeId: 2, jobIds: [2], verifiedAt: '2026-09-12', keyBenefits: ['Low step-in', 'Long warranty', 'Flat floor'], documents: [{ title: 'Brochure', kind: 'brochure', language: 'en', url: 'https://example.com/b.pdf' }], specs: { battery_kwh: 71.2, range_km: 416, dc_kw: 150, payload_kg: 690, charging: ['ccs2', 'type2'], licence: 'B', eu_class: 'N1', v2x: 'opt' } }),
  listing({ id: 2, slug: 'kia-pv5-cargo-standard-range', brandId: 1, model: 'PV5 Cargo Standard Range', family: 'PV5 Cargo', typeId: 2, jobIds: [2], specs: { battery_kwh: 51.5, range_km: 293, dc_kw: 100, payload_kg: 790, charging: ['ccs2'], licence: 'B' } }),
  listing({ id: 3, slug: 'ford-e-transit-courier', brandId: 2, model: 'E-Transit Courier', typeId: 2, jobIds: [2], specs: { battery_kwh: 43, range_km: 288, dc_kw: 100, payload_kg: 700, charging: ['ccs2', 'type2'], licence: 'B', price_eur: 29990 }, updatedAt: '2026-09-25T10:00:00.000Z' }),
  listing({ id: 4, slug: 'mercedes-benz-eeconic', brandId: 3, model: 'eEconic', typeId: 4, jobIds: [4], specs: { battery_kwh: 336, range_km: 100, dc_kw: 160, charging: ['ccs2'], licence: 'C' } }),
  listing({ id: 5, slug: 'volvo-ce-ecr25-electric', brandId: 4, model: 'ECR25 Electric', typeId: 8, jobIds: [], specs: { battery_kwh: 40, runtime_h: 8, op_weight_kg: 2500, licence: 'none', eu_class: 'SPM' }, availability: 'orders-open' }),
  listing({ id: 6, slug: 'ford-heavy', brandId: 2, model: 'Heavy E', typeId: 6, jobIds: [4], specs: { battery_kwh: 400, range_km: 300, payload_kg: 12000 }, availability: 'announced' }),
]

export const data: CatalogData = {
  locale: 'en',
  generatedAt: NOW.toISOString(),
  specs,
  types,
  jobs,
  brands,
  listings,
  placements: [
    { id: 1, kind: 'featured-listing', brandId: 1, listingIds: [1], onHome: true, onBrandHub: false, onGuides: false, typeIds: [1], jobIds: [], priority: 1 },
    { id: 2, kind: 'featured-listing', brandId: 2, listingIds: [3], onHome: true, onBrandHub: false, onGuides: false, typeIds: [1], jobIds: [], priority: 5 },
  ],
  landings: [{ id: 1, typeId: 5, jobId: 4, title: 'Electric trucks for waste collection', intro: null, faqs: [], seo: {}, hasLocale: true }],
  settings: {
    tagline: null,
    notice: null,
    contactEmail: null,
    partnersEmail: null,
    organization: { legalName: null, logoUrl: null, sameAs: [] },
    owner: { name: null, role: null, bio: null, url: null },
    openDataEnabled: false,
    openDataLicence: null,
  },
  pricing: { tiers: [], note: null },
  redirects: { '/vehicles/old-slug': '/vehicles/kia-pv5-cargo-long-range' },
}

export const makeCatalog = (now = NOW) => new Catalog(structuredClone(data), now)
