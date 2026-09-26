/**
 * Read model over CatalogData: indexes plus the business rules every page shares
 * (what a partnership unlocks, when a verification is valid, which listings a hub covers).
 * Pure: no I/O, so it can be unit-tested with fixtures.
 */
import { KEY_FIGURE_COUNT, VERIFICATION_VALID_DAYS } from '../constants'
import type { Brand, CatalogData, JobNode, Listing, Placement, SpecDef, TypeNode } from './types'

export type TaxonomyNode = TypeNode | JobNode

export class Catalog {
  readonly data: CatalogData
  readonly now: Date
  readonly specs: SpecDef[]
  readonly specByKey: Map<string, SpecDef>
  readonly specByUrlKey: Map<string, SpecDef>
  readonly types: TypeNode[]
  readonly typeById: Map<number, TypeNode>
  readonly typeBySlug: Map<string, TypeNode>
  readonly jobs: JobNode[]
  readonly jobById: Map<number, JobNode>
  readonly jobBySlug: Map<string, JobNode>
  readonly brands: Brand[]
  readonly brandById: Map<number, Brand>
  readonly brandBySlug: Map<string, Brand>
  /** Listings published in this locale. */
  readonly listings: Listing[]
  readonly listingById: Map<number, Listing>
  readonly listingBySlug: Map<string, Listing>

  constructor(data: CatalogData, now = new Date()) {
    this.data = data
    this.now = now
    this.specs = data.specs
    this.specByKey = new Map(data.specs.map((s) => [s.key, s]))
    this.specByUrlKey = new Map(data.specs.map((s) => [s.urlKey, s]))
    this.types = data.types.filter((t) => t.hasLocale)
    this.typeById = new Map(this.types.map((t) => [t.id, t]))
    this.typeBySlug = new Map(this.types.map((t) => [t.slug, t]))
    this.jobs = data.jobs.filter((j) => j.hasLocale)
    this.jobById = new Map(this.jobs.map((j) => [j.id, j]))
    this.jobBySlug = new Map(this.jobs.map((j) => [j.slug, j]))
    this.brands = data.brands
    this.brandById = new Map(data.brands.map((b) => [b.id, b]))
    this.brandBySlug = new Map(data.brands.map((b) => [b.slug, b]))
    this.listings = data.listings.filter((l) => l.hasLocale && this.typeById.has(l.typeId))
    this.listingById = new Map(this.listings.map((l) => [l.id, l]))
    this.listingBySlug = new Map(this.listings.map((l) => [l.slug, l]))
  }

  // ── Taxonomy ────────────────────────────────────────────────────────────────────────────

  get groups(): TypeNode[] {
    return this.types.filter((t) => !t.parentId)
  }

  get areas(): JobNode[] {
    return this.jobs.filter((j) => !j.parentId)
  }

  childrenOf<T extends TaxonomyNode>(node: T): T[] {
    const map = (node.kind === 'type' ? this.typeById : this.jobById) as Map<number, T>
    return node.childIds.map((id) => map.get(id)).filter((x): x is T => Boolean(x))
  }

  parentOf<T extends TaxonomyNode>(node: T): T | null {
    if (!node.parentId) return null
    const map = (node.kind === 'type' ? this.typeById : this.jobById) as Map<number, T>
    return map.get(node.parentId) ?? null
  }

  /** Types shown under a group: its own types plus types cross-listed into it. */
  typesInGroup(group: TypeNode): TypeNode[] {
    const own = this.childrenOf(group)
    const cross = this.types.filter((t) => t.parentId && t.parentId !== group.id && t.alsoListedIn.includes(group.id))
    return [...own, ...cross]
  }

  /** Leaf type ids covered by a type node. */
  typeScope(node: TypeNode): Set<number> {
    if (node.parentId) return new Set([node.id])
    return new Set(this.typesInGroup(node).map((t) => t.id))
  }

  /** Leaf job ids covered by a job node. */
  jobScope(node: JobNode): Set<number> {
    if (node.parentId) return new Set([node.id])
    return new Set(node.childIds)
  }

  listingsForType(node: TypeNode, from: Listing[] = this.listings): Listing[] {
    const scope = this.typeScope(node)
    return from.filter((l) => scope.has(l.typeId))
  }

  listingsForJob(node: JobNode, from: Listing[] = this.listings): Listing[] {
    const scope = this.jobScope(node)
    return from.filter((l) => l.jobIds.some((id) => scope.has(id)))
  }

  listingsForBrand(brand: Brand): Listing[] {
    return this.listings.filter((l) => l.brandId === brand.id)
  }

  /**
   * Resolve `/types/…` segments: [group], [group, type], [group, 'for', job], [group, type, 'for', job].
   * The job segment is a job or area slug. Returns null when the path is not canonical.
   */
  resolveTypePath(segments: string[], comboSegment: string): { type: TypeNode; job: JobNode | null } | null {
    const forIndex = segments.indexOf(comboSegment)
    const typeSegs = forIndex >= 0 ? segments.slice(0, forIndex) : segments
    const jobSegs = forIndex >= 0 ? segments.slice(forIndex + 1) : []
    if (typeSegs.length < 1 || typeSegs.length > 2 || (forIndex >= 0 && jobSegs.length !== 1)) return null
    const type = this.typeBySlug.get(typeSegs[typeSegs.length - 1])
    if (!type || type.path.join('/') !== typeSegs.join('/')) return null
    const job = jobSegs.length ? this.jobBySlug.get(jobSegs[0]) : null
    if (jobSegs.length && !job) return null
    return { type, job: job ?? null }
  }

  resolveJobPath(segments: string[]): JobNode | null {
    if (segments.length < 1 || segments.length > 2) return null
    const job = this.jobBySlug.get(segments[segments.length - 1])
    if (!job || job.path.join('/') !== segments.join('/')) return null
    return job
  }

  /** Curated type × job page, if one exists for this pair. */
  landingFor(type: TypeNode, job: JobNode) {
    return this.data.landings.find((l) => l.typeId === type.id && l.jobId === job.id && l.hasLocale) ?? null
  }

  // ── Listings ────────────────────────────────────────────────────────────────────────────

  brandOf(listing: Listing): Brand {
    return this.brandById.get(listing.brandId)!
  }

  typeOf(listing: Listing): TypeNode {
    return this.typeById.get(listing.typeId)!
  }

  groupOf(type: TypeNode): TypeNode {
    return type.parentId ? (this.typeById.get(type.parentId) ?? type) : type
  }

  jobsOf(listing: Listing): JobNode[] {
    return listing.jobIds.map((id) => this.jobById.get(id)).filter((j): j is JobNode => Boolean(j))
  }

  /** Spec rows for the listing's type, in page order. */
  profileSpecs(listing: Listing): SpecDef[] {
    return this.typeOf(listing)
      .specKeys.map((k) => this.specByKey.get(k))
      .filter((s): s is SpecDef => Boolean(s))
  }

  keyFigureSpecs(typeOrListing: TypeNode | Listing): SpecDef[] {
    const type = 'keyFigures' in typeOrListing ? typeOrListing : this.typeOf(typeOrListing)
    return type.keyFigures
      .map((k) => this.specByKey.get(k))
      .filter((s): s is SpecDef => Boolean(s))
      .slice(0, KEY_FIGURE_COUNT)
  }

  /** "Data confirmed by <brand>": needs an active paid partnership and a confirmation < 12 months old. */
  isVerified(listing: Listing): boolean {
    if (!listing.verifiedAt || !this.brandOf(listing).partnerActive) return false
    const age = this.now.getTime() - new Date(listing.verifiedAt).getTime()
    return age >= 0 && age <= VERIFICATION_VALID_DAYS * 86400000
  }

  showContact(listing: Listing): boolean {
    const b = this.brandOf(listing)
    return b.partnerActive && b.tier !== 'free' && Boolean(b.contact?.email)
  }

  showDocuments(listing: Listing): boolean {
    const b = this.brandOf(listing)
    return b.partnerActive && b.tier !== 'free' && listing.documents.length > 0
  }

  showBenefits(listing: Listing): boolean {
    const b = this.brandOf(listing)
    return b.partnerActive && b.tier === 'pro' && listing.keyBenefits.length > 0
  }

  hasPrice(listing: Listing): boolean {
    return typeof listing.specs.price_eur === 'number'
  }

  /** Share of the type's spec rows that have a value; key figures count double. */
  completeness(listing: Listing): number {
    const type = this.typeOf(listing)
    let have = 0
    let total = 0
    for (const key of type.specKeys) {
      const w = type.keyFigures.includes(key) ? 2 : 1
      total += w
      const v = listing.specs[key]
      if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) have += w
    }
    return total ? have / total : 0
  }

  /** Other versions of the same model (same brand and model family). */
  versionsOf(listing: Listing): Listing[] {
    if (!listing.family) return []
    return this.listings.filter(
      (l) => l.id !== listing.id && l.brandId === listing.brandId && l.family === listing.family,
    )
  }

  // ── Paid placements ─────────────────────────────────────────────────────────────────────

  private livePlacements(): Placement[] {
    return this.data.placements.filter((p) => this.brandById.get(p.brandId)?.partnerActive)
  }

  /** Up to two featured listings for a surface. Always rendered with a "Featured partner" label. */
  featuredListings(where: { home?: boolean; type?: TypeNode; job?: JobNode; brand?: Brand }): Listing[] {
    const out: Listing[] = []
    const typeIds = where.type ? new Set([where.type.id, ...(where.type.parentId ? [where.type.parentId] : [])]) : null
    const jobIds = where.job ? new Set([where.job.id, ...(where.job.parentId ? [where.job.parentId] : [])]) : null
    for (const p of this.livePlacements()) {
      if (p.kind !== 'featured-listing') continue
      const match =
        (where.home && p.onHome) ||
        (where.brand && p.onBrandHub && p.brandId === where.brand.id) ||
        (typeIds && p.typeIds.some((id) => typeIds.has(id))) ||
        (jobIds && p.jobIds.some((id) => jobIds.has(id)))
      if (!match) continue
      for (const id of p.listingIds) {
        const l = this.listingById.get(id)
        if (!l || out.some((x) => x.id === l.id)) continue
        if (where.type && !this.typeScope(where.type).has(l.typeId)) continue
        out.push(l)
      }
      if (out.length >= 2) break
    }
    return out.slice(0, 2)
  }

  /** One brand spotlight for a surface. */
  spotlight(where: { type?: TypeNode; job?: JobNode; guides?: boolean }): Brand | null {
    const typeIds = where.type ? new Set([where.type.id, ...(where.type.parentId ? [where.type.parentId] : [])]) : null
    const jobIds = where.job ? new Set([where.job.id, ...(where.job.parentId ? [where.job.parentId] : [])]) : null
    for (const p of this.livePlacements()) {
      if (p.kind !== 'brand-spotlight') continue
      const match =
        (where.guides && p.onGuides) ||
        (typeIds && p.typeIds.some((id) => typeIds.has(id))) ||
        (jobIds && p.jobIds.some((id) => jobIds.has(id)))
      if (match) return this.brandById.get(p.brandId) ?? null
    }
    return null
  }

  // ── Stats ───────────────────────────────────────────────────────────────────────────────

  countForType(node: TypeNode): number {
    return this.listingsForType(node).length
  }

  countForJob(node: JobNode): number {
    return this.listingsForJob(node).length
  }

  /** Brands that have at least one listing in this locale. */
  get activeBrands(): Brand[] {
    const used = new Set(this.listings.map((l) => l.brandId))
    return this.brands.filter((b) => used.has(b.id))
  }

  latestUpdate(listings: Listing[] = this.listings): string | null {
    return listings.reduce<string | null>((max, l) => (!max || l.updatedAt > max ? l.updatedAt : max), null)
  }
}
