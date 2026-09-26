import { FEATURE_VALUES, type FeatureValue, type SpecDataType } from '../constants'

export type SpecValue = number | string | string[] | boolean
export type SpecValues = Record<string, SpecValue>

/** The part of a spec definition needed to validate a value. */
export type SpecRule = {
  key: string
  label?: string
  dataType: SpecDataType
  options?: { value: string }[] | null
  min?: number | null
  max?: number | null
}

const MAX_TEXT = 200

/** Parse "71,2", "71.2", " 1 000 " and numbers into a finite number. */
export const parseNumber = (input: unknown): number | null => {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  if (typeof input !== 'string') return null
  const s = input.trim().replace(/\s|'/g, '')
  if (!s) return null
  // "1.234,5" (de) → 1234.5 ; "1,234.5" (en) → 1234.5 ; "71,2" → 71.2
  let normalized = s
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) normalized = s.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) normalized = s.replace(/,/g, '')
  else normalized = s.replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export const isEmptyValue = (v: unknown) =>
  v == null || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * Validate and normalise listing spec values against the spec definitions.
 * - coerces numeric strings, trims text, dedupes multiselect values
 * - drops empty values and keys that are no longer defined
 * - returns human-readable errors for values that do not fit the definition
 */
export function normalizeSpecValues(
  input: unknown,
  rules: Map<string, SpecRule>,
): { values: SpecValues; errors: string[]; dropped: string[] } {
  const values: SpecValues = {}
  const errors: string[] = []
  const dropped: string[] = []
  if (input == null) return { values, errors, dropped }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { values, errors: ['Spec values must be an object.'], dropped }
  }

  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    if (isEmptyValue(raw)) continue
    const rule = rules.get(key)
    if (!rule) {
      dropped.push(key)
      continue
    }
    const name = rule.label || key
    const allowed = new Set((rule.options ?? []).map((o) => o.value))
    switch (rule.dataType) {
      case 'number': {
        const n = parseNumber(raw)
        if (n == null) {
          errors.push(`${name}: "${String(raw)}" is not a number.`)
          break
        }
        if (rule.min != null && n < rule.min) errors.push(`${name}: ${n} is below the minimum of ${rule.min}.`)
        else if (rule.max != null && n > rule.max) errors.push(`${name}: ${n} is above the maximum of ${rule.max}.`)
        else values[key] = n
        break
      }
      case 'select': {
        const v = String(raw)
        if (!allowed.has(v)) errors.push(`${name}: "${v}" is not one of the options.`)
        else values[key] = v
        break
      }
      case 'multiselect': {
        const arr = (Array.isArray(raw) ? raw : [raw]).map(String)
        const bad = arr.filter((v) => !allowed.has(v))
        if (bad.length) errors.push(`${name}: ${bad.map((b) => `"${b}"`).join(', ')} not in the options.`)
        const good = [...new Set(arr.filter((v) => allowed.has(v)))]
        if (good.length) values[key] = good
        break
      }
      case 'boolean': {
        if (raw === true || raw === 'true' || raw === 1 || raw === '1') values[key] = true
        else if (raw === false || raw === 'false' || raw === 0 || raw === '0') values[key] = false
        else errors.push(`${name}: expected yes or no.`)
        break
      }
      case 'feature': {
        const v = String(raw) as FeatureValue
        if (!FEATURE_VALUES.includes(v)) errors.push(`${name}: expected standard, optional or not available.`)
        else values[key] = v
        break
      }
      case 'text': {
        const v = String(raw).trim().slice(0, MAX_TEXT)
        if (v) values[key] = v
        break
      }
    }
  }
  return { values, errors, dropped }
}
