/**
 * Citable fact sentences generated from data (docs/03 §6): LLMs quote sentences better than tables.
 * Message keys are relative to the `facts` namespace.
 * Example: "The Kia PV5 Cargo Long Range (small van) has a 71.2 kWh usable battery, a range of up to
 * 416 km, DC charging at up to 150 kW and a payload of up to 690 kg."
 */
import type { Locale } from '../../i18n/config'
import type { Catalog } from './catalog'
import { formatDate, formatPrice, formatSpec, type ValueLabels } from './format'
import { lcFirst } from '../text'
import type { Listing } from './types'

export type Translate = (key: string, values?: Record<string, string | number>) => string
type HasKey = (key: string) => boolean

/** Spec keys with a hand-written clause in messages (facts.clause.<key>). */
const CLAUSE_KEYS = [
  'battery_kwh',
  'range_km',
  'runtime_h',
  'dc_kw',
  'ac_kw',
  'payload_kg',
  'cargo_m3',
  'passengers',
  'op_weight_kg',
  'lift_kg',
  'lift_height_m',
  'working_height_m',
  'dig_depth_m',
  'hopper_m3',
  'work_width_m',
  'gvw_t',
  'gcw_t',
  'power_kw',
  'towing_kg',
  'length_m',
  'top_speed_kmh',
  'max_slope_deg',
  'body_volume_m3',
  'water_tank_l',
  'outreach_m',
]

function joinList(items: string[], and: string) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}

export function factSentences(
  listing: Listing,
  catalog: Catalog,
  locale: Locale,
  t: Translate,
  has: HasKey,
  labels: ValueLabels,
): string[] {
  const type = catalog.typeOf(listing)
  const sentences: string[] = []

  // 1. Key figures, in the order of the type's key figures, then battery/range/charging if missing.
  const keys = [...type.keyFigures, 'battery_kwh', 'range_km', 'runtime_h', 'dc_kw']
  const seen = new Set<string>()
  const clauses: string[] = []
  for (const key of keys) {
    if (seen.has(key) || clauses.length >= 4) continue
    seen.add(key)
    const spec = catalog.specByKey.get(key)
    const value = listing.specs[key]
    if (!spec || !type.specKeys.includes(key) || typeof value !== 'number') continue
    const formatted = formatSpec(spec, value, locale, labels)
    if (!formatted) continue
    clauses.push(
      CLAUSE_KEYS.includes(key) && has(`clause.${key}`)
        ? t(`clause.${key}`, { value: formatted })
        : t('clause.generic', { label: spec.label, value: formatted }),
    )
  }
  if (clauses.length) {
    sentences.push(t('lead', { title: listing.title, type: lcFirst(type.name, locale), clauses: joinList(clauses, t('and')) }))
  }

  // 2. Availability and price.
  const price = listing.specs.price_eur
  const status = t(`status.${listing.availability}`)
  sentences.push(
    typeof price === 'number'
      ? t('priceKnown', { status, price: formatPrice(price, locale) })
      : t('priceUnknown', { status }),
  )

  // 3. Provenance.
  const brand = catalog.brandOf(listing)
  sentences.push(
    catalog.isVerified(listing)
      ? t('verified', { brand: brand.name, date: formatDate(listing.verifiedAt, locale) })
      : t('compiled', { date: formatDate(listing.updatedAt, locale) }),
  )
  return sentences
}
