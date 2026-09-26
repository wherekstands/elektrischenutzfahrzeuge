/**
 * Domain constants shared by the Payload config (select options, validation) and the frontend.
 * Changing an `id` here is a breaking change for stored data; labels live in messages/*.json.
 */

/** Availability of a listing. Order = display order in filters. */
export const STATUSES = ['on-sale', 'orders-open', 'announced', 'discontinued'] as const
export type Status = (typeof STATUSES)[number]

/**
 * Spec groups define the fixed section order of every spec table (vehicle page, compare, admin editor).
 * This is what keeps every listing page structurally identical: a type only decides which rows appear.
 */
export const SPEC_GROUPS = [
  'energy',
  'charging',
  'performance',
  'dimensions',
  'capacity',
  'work',
  'operation',
  'commercial',
] as const
export type SpecGroup = (typeof SPEC_GROUPS)[number]

export const SPEC_DATA_TYPES = ['number', 'select', 'multiselect', 'boolean', 'feature', 'text'] as const
export type SpecDataType = (typeof SPEC_DATA_TYPES)[number]

/** Values of `feature`-type specs: standard equipment, optional, not available. */
export const FEATURE_VALUES = ['std', 'opt', 'no'] as const
export type FeatureValue = (typeof FEATURE_VALUES)[number]

/** Built-in SVG illustrations used when a listing has no photos. */
export const ILLUSTRATIONS = [
  'van',
  'pickup',
  'utv',
  'micro',
  'bike',
  'truck',
  'tractor',
  'bus',
  'refuse',
  'sweeper',
  'carrier',
  'excavator',
  'loader',
  'telehandler',
  'dumper',
  'roller',
  'platform',
  'agtractor',
  'mower',
  'forklift',
  'yard',
  'tug',
] as const
export type Illustration = (typeof ILLUSTRATIONS)[number]

/** Partner tiers, in ascending order of benefits. */
export const TIERS = ['free', 'starter', 'pro'] as const
export type Tier = (typeof TIERS)[number]

export const DOCUMENT_KINDS = [
  'brochure',
  'datasheet',
  'pricelist',
  'manual',
  'certificate',
  'video',
  'other',
] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

export const IMAGE_LICENCES = ['press-kit', 'manufacturer-permission', 'own', 'cc-by', 'cc-by-sa', 'other'] as const

export const USER_ROLES = ['admin', 'editor', 'partner'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const CHANGE_REQUEST_KINDS = ['correction', 'partner-edit', 'claim'] as const
export const CHANGE_REQUEST_STATUSES = ['new', 'in-review', 'applied', 'rejected', 'spam'] as const

/** Placement surfaces for paid visibility. */
export const PLACEMENT_KINDS = ['featured-listing', 'brand-spotlight'] as const

/** A verification ("Data confirmed by <brand>") is valid this many days after `verifiedAt`. */
export const VERIFICATION_VALID_DAYS = 365

/** Max vehicles in the compare view. */
export const MAX_COMPARE = 4

/** Hubs with fewer listings than this get `noindex` until they grow (docs/03 §7). */
export const MIN_LISTINGS_TO_INDEX_HUB = 3

/** Curated type × job pages are only indexable with at least this many listings (docs/03 §1). */
export const MIN_LISTINGS_TO_INDEX_COMBO = 3

/** Results per page on hubs and the vehicle index. */
export const PAGE_SIZE = 24

/** Key figures shown in the hero (the first three also appear on cards). */
export const KEY_FIGURE_COUNT = 4
export const CARD_FIGURE_COUNT = 3

/** Max length of a key fact or benefit line. */
export const HIGHLIGHT_MAX_CHARS = 90

/** Cache tag for everything derived from the catalogue. */
export const CATALOG_TAG = 'catalog'

/** English labels for spec groups in the admin (the website uses messages/*.json). */
export const SPEC_GROUP_ADMIN_LABELS: Record<SpecGroup, string> = {
  energy: 'Energy & range',
  charging: 'Charging',
  performance: 'Drivetrain & performance',
  dimensions: 'Dimensions & weights',
  capacity: 'Load & passenger capacity',
  work: 'Work equipment',
  operation: 'Configuration & operation',
  commercial: 'Price & warranty',
}
