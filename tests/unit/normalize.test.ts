import { describe, expect, it } from 'vitest'

import { slugify, validateSlug } from '@/fields/slug'
import { normalizeSpecValues, parseNumber, type SpecRule } from '@/lib/specs/normalize'

describe('parseNumber', () => {
  it.each([
    ['71,2', 71.2],
    ['71.2', 71.2],
    [' 1 000 ', 1000],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['12.000', 12000],
    ["12'000", 12000],
    [42, 42],
  ])('%s → %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected)
  })

  it('rejects non-numbers', () => {
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('')).toBeNull()
    expect(parseNumber(Number.NaN)).toBeNull()
    expect(parseNumber(null)).toBeNull()
  })
})

describe('normalizeSpecValues', () => {
  const rules = new Map<string, SpecRule>(
    (
      [
        { key: 'battery_kwh', label: 'Battery', dataType: 'number', min: 1, max: 2000 },
        { key: 'charging', dataType: 'multiselect', options: [{ value: 'ccs2' }, { value: 'type2' }] },
        { key: 'licence', dataType: 'select', options: [{ value: 'B' }, { value: 'C' }] },
        { key: 'v2x', dataType: 'feature' },
        { key: 'tipper', dataType: 'boolean' },
        { key: 'note', dataType: 'text' },
      ] as SpecRule[]
    ).map((r) => [r.key, r]),
  )

  it('coerces, dedupes and drops empty values and unknown keys', () => {
    const r = normalizeSpecValues(
      { battery_kwh: '71,2', charging: ['ccs2', 'ccs2', 'type2'], licence: 'B', v2x: 'opt', tipper: 'true', note: '  hi  ', empty: '', old_key: 5, blank: [] },
      rules,
    )
    expect(r.values).toEqual({ battery_kwh: 71.2, charging: ['ccs2', 'type2'], licence: 'B', v2x: 'opt', tipper: true, note: 'hi' })
    expect(r.dropped).toEqual(['old_key'])
    expect(r.errors).toEqual([])
  })

  it('reports values that do not fit the definition', () => {
    const r = normalizeSpecValues({ battery_kwh: '5000', charging: ['ccs2', 'chademo'], licence: 'X', v2x: 'maybe', tipper: 'perhaps' }, rules)
    expect(r.values).toEqual({ charging: ['ccs2'] })
    expect(r.errors).toHaveLength(5)
    expect(r.errors[0]).toContain('above the maximum')
  })

  it('rejects non-objects', () => {
    expect(normalizeSpecValues([1, 2], rules).errors).toHaveLength(1)
    expect(normalizeSpecValues(null, rules).values).toEqual({})
  })
})

describe('slugify', () => {
  it.each([
    ['Mercedes-Benz eActros 600', 'mercedes-benz-eactros-600'],
    ['Straßenkehrmaschinen', 'strassenkehrmaschinen'],
    ['Müllfahrzeuge & Kehrer', 'muellfahrzeuge-and-kehrer'],
    ['  Škoda  Électrique  ', 'skoda-electrique'],
    ['A--B', 'a-b'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })

  it('validates slugs and reserves the combo segment', () => {
    expect(validateSlug('street-sweepers')).toBe(true)
    expect(validateSlug('')).toBe(true)
    expect(validateSlug('Street Sweepers')).not.toBe(true)
    expect(validateSlug('a--b')).not.toBe(true)
    expect(validateSlug('for')).not.toBe(true)
    expect(validateSlug('fuer')).not.toBe(true)
  })
})
