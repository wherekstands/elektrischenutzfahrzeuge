/**
 * Shape of reference/catalog.json, the prototype's catalogue export. The schema id "efleet-register/2" is the
 * prototype's old working name; keep reading it as-is, the new product is called ECV Base.
 * Use these types for Phase 1 fixtures and for the Phase 2 seed script. They are NOT the final Payload types.
 */
export type CatalogExport = {
  schema: 'efleet-register/2'
  updatedAt: string // ISO
  notice: string // disclaimer shown in the footer and on vehicle pages
  categories: TreeNode[] // vehicle types, 2 levels
  applications: TreeNode[] // jobs, 2 levels
  attributes: Attribute[] // spec definitions
  statuses: { id: Status; label: string }[]
  listings: Listing[]
  partners: Partner[] // one per brand; demo: true = fictional sample data, never import to production
  settings: { contactEmail: string }
}

export type TreeNode = {
  id: string // slug-like, stable
  name: string
  parentId: string | null
  icon: IllustrationType | null // top level has one, children may inherit
  description: string
  order: number
}

export type IllustrationType =
  | 'van' | 'pickup' | 'utv' | 'micro' | 'bike' | 'truck' | 'tractor' | 'bus' | 'refuse' | 'sweeper'
  | 'carrier' | 'excavator' | 'loader' | 'telehandler' | 'dumper' | 'agtractor' | 'mower' | 'forklift' | 'yard' | 'tug'

export type Attribute = {
  id: string // code, e.g. 'range_km'; key in Listing.values
  name: string
  type: 'number' | 'select' | 'multiselect' | 'boolean' | 'feature' | 'text'
  unit?: string // number only, e.g. 'km', 'kWh', '€'
  group: string // 'Energy & charging' | 'Drivetrain' | 'Weights & capacity' | 'Operation' | 'Commercial'
  help?: string
  options?: { id: string; label: string }[] // select / multiselect
  filterable: boolean
  card: boolean // shown as a key figure on cards
  compare: boolean
  better?: 'high' | 'low' // enables "best" marking and sort
  appliesTo: string[] | null // top-level or sub category ids; empty/null = all
  order: number
}

export type Status = 'on-sale' | 'orders-open' | 'announced' | 'discontinued'

/** feature-type values: 'std' standard, 'opt' optional, 'no' not available */
export type SpecValue = number | string | string[] | boolean

export type Listing = {
  id: string // becomes the URL slug
  brand: string // brand name; brands are derived from this in the seed
  name: string // model/version name without brand
  family: string // groups real variants (separate listings) of one model
  categoryId: string // exactly one vehicle type (usually a subtype)
  apps: string[] // application ids, many
  status: Status
  summary: string
  url?: string // manufacturer source page
  values: Record<string, SpecValue> // keyed by Attribute.id
  facts?: string[] // max 3, <= 90 chars
  benefits?: string[] // max 3, <= 90 chars, shown only for Pro partners
  benefitsDemo?: boolean
  docs?: { title: string; kind: 'brochure' | 'datasheet' | 'pricelist' | 'manual' | 'certificate' | 'video' | 'other'; url: string; lang?: string; size?: string; fromMaker?: boolean; demo?: boolean }[]
  images?: { src: string; alt: string; credit: string }[] // data URIs in the prototype; none in this export
  verifiedAt?: string // date the manufacturer confirmed the data; valid 365 days with an active partner
  updatedAt: string // YYYY-MM-DD
}

export type Partner = {
  brand: string
  tier: 'none' | 'starter' | 'pro'
  validUntil?: string // YYYY-MM-DD
  demo?: boolean
  contact: { name?: string; role?: string; region?: string; email?: string; phone?: string; note?: string }
}
