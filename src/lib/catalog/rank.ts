/**
 * Ordering of result lists. Documented for visitors on /how-ranking-works (keep both in sync).
 *
 * "Recommended" (default):
 *   1. paid partnership boost (Pro 2 > Starter 1 > none 0), labelled "Sponsored" in the UI
 *   2. search relevance (only when searching)
 *   3. availability (on sale > order books open > announced > discontinued)
 *   4. data completeness
 *   5. vehicle type order, then name
 *
 * Every explicit sort (name, updated, a spec) is purely data-based: payment has no influence.
 */
import { STATUSES } from '../constants'
import type { Catalog } from './catalog'
import { searchScore, tokenize } from './filters'
import type { Listing, SpecDef } from './types'

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export type SortOption = { value: string; spec?: SpecDef; direction?: 'asc' | 'desc' }

/** Sorts offered for a scope: recommended, name, every numeric spec with a "better" direction that ≥ 2 listings have, updated. */
export function sortOptions(scope: Listing[], catalog: Catalog, current?: string): SortOption[] {
  const out: SortOption[] = [{ value: 'recommended' }, { value: 'name' }]
  const keys = new Set<string>()
  for (const l of scope) for (const k of catalog.typeOf(l).specKeys) keys.add(k)
  for (const spec of catalog.specs) {
    if (spec.dataType !== 'number' || !spec.better || !keys.has(spec.key)) continue
    const direction = spec.better === 'low' ? 'asc' : 'desc'
    const value = `${spec.urlKey}-${direction}`
    const withValue = scope.filter((l) => typeof l.specs[spec.key] === 'number').length
    if (withValue < 2 && current !== value) continue
    out.push({ value, spec, direction })
  }
  out.push({ value: 'updated' })
  return out
}

/** Paid boost of a listing in the "Recommended" order (0 = none). */
export const boostOf = (l: Listing, catalog: Catalog): 0 | 1 | 2 => catalog.brandOf(l).boost

export function sortListings(list: Listing[], sort: string, catalog: Catalog, q = ''): Listing[] {
  const L = list.slice()
  const byName = (a: Listing, b: Listing) => collator.compare(a.title, b.title)

  if (sort === 'name') return L.sort(byName)
  if (sort === 'updated') return L.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || byName(a, b))

  const m = /^(.+)-(asc|desc)$/.exec(sort)
  const spec = m ? catalog.specByUrlKey.get(m[1]) : undefined
  if (m && spec) {
    const dir = m[2] === 'asc' ? 1 : -1
    return L.sort((a, b) => {
      const va = a.specs[spec.key]
      const vb = b.specs[spec.key]
      const na = typeof va === 'number'
      const nb = typeof vb === 'number'
      if (!na && !nb) return byName(a, b)
      if (!na) return 1 // listings without the value always come last
      if (!nb) return -1
      return ((va as number) - (vb as number)) * dir || byName(a, b)
    })
  }

  // Recommended
  const tokens = tokenize(q)
  const relevance = new Map(L.map((l) => [l.id, tokens.length ? searchScore(l, tokens, catalog) : 0]))
  const availabilityRank = new Map(STATUSES.map((s, i) => [s, i]))
  const typeRank = (l: Listing) => {
    const t = catalog.typeOf(l)
    const g = catalog.groupOf(t)
    return g.order * 1000 + t.order
  }
  const completeness = new Map(L.map((l) => [l.id, Math.round(catalog.completeness(l) * 10)]))
  return L.sort(
    (a, b) =>
      boostOf(b, catalog) - boostOf(a, catalog) ||
      relevance.get(b.id)! - relevance.get(a.id)! ||
      availabilityRank.get(a.availability)! - availabilityRank.get(b.availability)! ||
      completeness.get(b.id)! - completeness.get(a.id)! ||
      typeRank(a) - typeRank(b) ||
      byName(a, b),
  )
}

/** Is this listing's position influenced by payment in the given sort? Then it must be labelled. */
export const isSponsoredPosition = (l: Listing, sort: string, catalog: Catalog) =>
  sort === 'recommended' && boostOf(l, catalog) > 0

/**
 * Similar vehicles: same type (or group), closest key figures. Purely data-based, no paid influence.
 */
export function similarListings(target: Listing, catalog: Catalog, count = 3): Listing[] {
  const type = catalog.typeOf(target)
  const group = catalog.groupOf(type)
  const figures = type.keyFigures
  const candidates = catalog.listings.filter(
    (l) =>
      l.id !== target.id &&
      !(target.family && l.family === target.family && l.brandId === target.brandId) &&
      catalog.groupOf(catalog.typeOf(l)).id === group.id,
  )
  const distance = (l: Listing) => {
    let d = l.typeId === target.typeId ? 0 : 2
    let compared = 0
    for (const key of figures) {
      const a = target.specs[key]
      const b = l.specs[key]
      if (typeof a === 'number' && typeof b === 'number' && a > 0) {
        d += Math.min(2, Math.abs(a - b) / a)
        compared++
      } else d += 0.6
    }
    if (!compared) d += 1
    if (l.availability === 'discontinued') d += 1
    return d
  }
  return candidates
    .map((l) => ({ l, d: distance(l) }))
    .sort((a, b) => a.d - b.d || collator.compare(a.l.title, b.l.title))
    .slice(0, count)
    .map((x) => x.l)
}
