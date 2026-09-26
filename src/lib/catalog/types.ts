/**
 * Normalised, locale-resolved catalogue model used by every public page.
 * Built from Payload documents by ./load.ts; plain JSON so it can be cached and serialised.
 */
import type { Illustration, SpecDataType, SpecGroup, Status, Tier } from '../constants'
import type { SpecValues } from '../specs/normalize'

export type { SpecValues }

export type RichTextValue = { root: unknown } | null

export type Faq = { question: string; answer: string }

export type SeoOverride = { title?: string | null; description?: string | null; noindex?: boolean | null }

export type SpecDef = {
  id: number
  key: string
  urlKey: string
  label: string
  shortLabel: string
  help: string | null
  dataType: SpecDataType
  unit: string | null
  unitCode: string | null
  decimals: number | null
  group: SpecGroup
  order: number
  universal: boolean
  filterable: boolean
  showInCompare: boolean
  better: 'high' | 'low' | null
  options: { value: string; label: string }[]
  quickFilter: { min: number | null; label: string } | null
}

type TaxonomyNodeBase = {
  id: number
  slug: string
  name: string
  shortDescription: string | null
  parentId: number | null
  order: number
  illustration: Illustration | null
  intro: RichTextValue
  faqs: Faq[]
  synonyms: string[]
  seo: SeoOverride
  /** Slugs from the top: [group] or [group, type]. */
  path: string[]
  childIds: number[]
  /** The node has its own name and slug in this locale (docs/03 §8). */
  hasLocale: boolean
}

export type TypeNode = TaxonomyNodeBase & {
  kind: 'type'
  alsoListedIn: number[]
  /** Resolved spec profile: universal + group + type specs, in page order. */
  specKeys: string[]
  /** Resolved key figures (type, else group). */
  keyFigures: string[]
}

export type JobNode = TaxonomyNodeBase & {
  kind: 'job'
  typicalTypeIds: number[]
}

export type ImageRef = {
  id: number
  alt: string
  credit: string | null
  width: number
  height: number
  url: string
  sizes: Partial<Record<'thumb' | 'card' | 'large' | 'og', { url: string; width: number; height: number }>>
}

export type Contact = {
  name: string | null
  role: string | null
  email: string | null
  phone: string | null
  region: string | null
}

export type Brand = {
  id: number
  name: string
  slug: string
  logo: ImageRef | null
  country: string | null
  website: string | null
  description: string | null
  tagline: string | null
  contact: Contact | null
  /** Effective tier today: paid tiers fall back to "free" when expired or cancelled. */
  tier: Tier
  partnerActive: boolean
  /** 2 = Pro, 1 = Starter, 0 = none. Only when "boost in Recommended" is on. */
  boost: 0 | 1 | 2
  highlight: boolean
  demo: boolean
}

export type ListingDocument = { title: string; kind: string; language: string | null; url: string }

export type Listing = {
  id: number
  slug: string
  brandId: number
  model: string
  family: string | null
  /** "<Brand> <Model>" */
  title: string
  typeId: number
  jobIds: number[]
  availability: Status
  summary: string
  specs: SpecValues
  keyFacts: string[]
  keyBenefits: string[]
  images: ImageRef[]
  documents: ListingDocument[]
  sourceUrl: string | null
  sources: { label: string; url: string }[]
  verifiedAt: string | null
  updatedAt: string
  createdAt: string
  seo: SeoOverride
  demo: boolean
  hasLocale: boolean
}

export type Placement = {
  id: number
  kind: 'featured-listing' | 'brand-spotlight'
  brandId: number
  listingIds: number[]
  onHome: boolean
  onBrandHub: boolean
  onGuides: boolean
  typeIds: number[]
  jobIds: number[]
  priority: number
}

export type LandingPage = {
  id: number
  typeId: number
  jobId: number
  title: string | null
  intro: RichTextValue
  faqs: Faq[]
  seo: SeoOverride
  hasLocale: boolean
}

export type SiteSettings = {
  tagline: string | null
  notice: string | null
  contactEmail: string | null
  partnersEmail: string | null
  organization: { legalName: string | null; logoUrl: string | null; sameAs: string[] }
  owner: { name: string | null; role: string | null; bio: string | null; url: string | null }
  openDataEnabled: boolean
  openDataLicence: string | null
}

export type PricingTier = {
  tier: Tier
  name: string
  pricePerModelYear: number | null
  highlight: boolean
  description: string | null
  features: { text: string; included: boolean }[]
}

export type CatalogData = {
  locale: string
  generatedAt: string
  specs: SpecDef[]
  types: TypeNode[]
  jobs: JobNode[]
  brands: Brand[]
  listings: Listing[]
  placements: Placement[]
  landings: LandingPage[]
  settings: SiteSettings
  pricing: { tiers: PricingTier[]; note: string | null }
  /** Internal path → internal path (locale-less), e.g. /vehicles/old → /vehicles/new */
  redirects: Record<string, string>
}
