/**
 * All numbers, prices and dates go through Intl (docs/03 §8): en → "71.2 kWh", "€49,990";
 * de → "71,2 kWh", "49.990 €".
 */
import { INTL_LOCALE, type Locale } from '../../i18n/config'
import type { SpecDef } from './types'

/** Units that need translating; everything else (kWh, km, kW…) is international. */
const UNIT_LABELS: Record<Locale, Record<string, string>> = {
  en: { years: 'years', pax: 'pax', min: 'min' },
  de: { years: 'Jahre', pax: 'Pers.', min: 'Min.' },
}

export const unitLabel = (unit: string | null, locale: Locale) => (unit ? (UNIT_LABELS[locale][unit] ?? unit) : '')

const nfCache = new Map<string, Intl.NumberFormat>()
function nf(locale: Locale, maxDecimals: number, minDecimals = 0) {
  const key = `${locale}|${maxDecimals}|${minDecimals}`
  let f = nfCache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(INTL_LOCALE[locale], {
      maximumFractionDigits: maxDecimals,
      minimumFractionDigits: minDecimals,
    })
    nfCache.set(key, f)
  }
  return f
}

export function formatNumber(value: number, locale: Locale, decimals?: number | null): string {
  const max = Number.isInteger(value) ? 0 : (decimals ?? 2)
  return nf(locale, max).format(value)
}

export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string | null | undefined, locale: Locale, style: 'long' | 'medium' | 'short' = 'long') {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: style === 'long' ? 'long' : style === 'medium' ? 'short' : '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  }).format(d)
}

export type ValueLabels = { yes: string; no: string; std: string; opt: string; notAvailable: string }

/** Value and unit separately, for tiles where the unit is rendered smaller. */
export function specParts(
  spec: SpecDef,
  value: unknown,
  locale: Locale,
  labels: ValueLabels,
): { value: string; unit: string } | null {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null
  switch (spec.dataType) {
    case 'number': {
      if (typeof value !== 'number') return null
      if (spec.unit === '€') return { value: formatPrice(value, locale), unit: '' }
      return { value: formatNumber(value, locale, spec.decimals), unit: unitLabel(spec.unit, locale) }
    }
    case 'select':
      return { value: spec.options.find((o) => o.value === value)?.label ?? String(value), unit: '' }
    case 'multiselect':
      return {
        value: (value as string[]).map((v) => spec.options.find((o) => o.value === v)?.label ?? v).join(', '),
        unit: '',
      }
    case 'boolean':
      return { value: value === true ? labels.yes : labels.no, unit: '' }
    case 'feature':
      return {
        value: value === 'std' ? labels.std : value === 'opt' ? labels.opt : labels.notAvailable,
        unit: '',
      }
    default:
      return { value: String(value), unit: '' }
  }
}

/** "71.2 kWh", "€49,990", "CCS2, Type 2 AC", "Standard". Null when there is no value. */
export function formatSpec(spec: SpecDef, value: unknown, locale: Locale, labels: ValueLabels): string | null {
  const p = specParts(spec, value, locale, labels)
  if (!p) return null
  return p.unit ? `${p.value} ${p.unit}` : p.value
}

export function formatRange(values: number[], spec: SpecDef, locale: Locale): string | null {
  if (!values.length) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const unit = spec.unit === '€' ? '' : unitLabel(spec.unit, locale)
  const f = (v: number) => (spec.unit === '€' ? formatPrice(v, locale) : formatNumber(v, locale, spec.decimals))
  const range = min === max ? f(min) : `${f(min)}–${f(max)}`
  return unit ? `${range} ${unit}` : range
}

/**
 * Charging time estimates (shown as estimates, see /methodology):
 * DC 10→80 % at 80 % of peak power; AC 0→100 % at 90 % of onboard charger power.
 */
export function chargingEstimates(specs: Record<string, unknown>) {
  const battery = specs.battery_kwh
  const dc = specs.dc_kw
  const ac = specs.ac_kw
  const out: { dcMinutes?: number; acHours?: number } = {}
  if (typeof battery === 'number' && typeof dc === 'number' && dc > 0) {
    out.dcMinutes = Math.max(10, Math.round(((battery * 0.7) / (dc * 0.8)) * 60 / 5) * 5)
  }
  if (typeof battery === 'number' && typeof ac === 'number' && ac > 0) {
    out.acHours = Math.max(0.5, Math.round((battery / (ac * 0.9)) * 2) / 2)
  }
  return out
}
