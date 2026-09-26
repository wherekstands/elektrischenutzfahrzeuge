import { describe, expect, it } from 'vitest'

import { chargingEstimates, formatDate, formatNumber, formatPrice, formatRange, formatSpec } from '@/lib/catalog/format'

import { specs } from '../fixtures/catalog'

const spec = (key: string) => specs.find((s) => s.key === key)!
const labels = { yes: 'Yes', no: 'No', std: 'Standard', opt: 'Optional', notAvailable: 'Not available' }

describe('format', () => {
  it('formats numbers per locale', () => {
    expect(formatNumber(71.2, 'en')).toBe('71.2')
    expect(formatNumber(71.2, 'de')).toBe('71,2')
    expect(formatNumber(12000, 'en')).toBe('12,000')
    expect(formatNumber(12000, 'de')).toBe('12.000')
  })

  it('formats prices in euros without decimals', () => {
    expect(formatPrice(49990, 'en')).toBe('€49,990')
    expect(formatPrice(49990, 'de').replace(/\s/g, ' ')).toBe('49.990 €')
  })

  it('formats dates in Europe/Berlin', () => {
    expect(formatDate('2026-09-12', 'en')).toBe('12 September 2026')
    expect(formatDate('2026-09-12', 'de')).toBe('12. September 2026')
    expect(formatDate(null, 'en')).toBe('')
    expect(formatDate('not a date', 'en')).toBe('')
  })

  it('formats spec values by data type', () => {
    expect(formatSpec(spec('battery_kwh'), 71.2, 'de', labels)).toBe('71,2 kWh')
    expect(formatSpec(spec('charging'), ['ccs2', 'type2'], 'en', labels)).toBe('CCS2, Type 2 AC')
    expect(formatSpec(spec('licence'), 'none', 'en', labels)).toBe('Not road-registered')
    expect(formatSpec(spec('v2x'), 'opt', 'en', labels)).toBe('Optional')
    expect(formatSpec(spec('price_eur'), 29990, 'en', labels)).toBe('€29,990')
    expect(formatSpec(spec('range_km'), null, 'en', labels)).toBeNull()
    expect(formatSpec(spec('charging'), [], 'en', labels)).toBeNull()
  })

  it('formats value ranges', () => {
    expect(formatRange([288, 416, 293], spec('range_km'), 'en')).toBe('288–416 km')
    expect(formatRange([300], spec('range_km'), 'en')).toBe('300 km')
    expect(formatRange([], spec('range_km'), 'en')).toBeNull()
  })

  it('estimates charging times', () => {
    // 71.2 kWh × 70 % / (150 kW × 80 %) = 0.415 h ≈ 25 min
    expect(chargingEstimates({ battery_kwh: 71.2, dc_kw: 150, ac_kw: 11 })).toEqual({ dcMinutes: 25, acHours: 7 })
    expect(chargingEstimates({ battery_kwh: 71.2 })).toEqual({})
  })
})
