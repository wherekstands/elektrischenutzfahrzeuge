'use client'

import { useField, useFormFields, useLocale } from '@payloadcms/ui'
import React, { useEffect, useMemo, useState } from 'react'

import { SPEC_GROUP_ADMIN_LABELS, SPEC_GROUPS, type SpecGroup } from '@/lib/constants'
import { parseNumber } from '@/lib/specs/normalize'

type SpecDoc = {
  id: number
  key: string
  label: string
  shortLabel?: string | null
  help?: string | null
  dataType: 'number' | 'select' | 'multiselect' | 'boolean' | 'feature' | 'text'
  unit?: string | null
  group: SpecGroup
  order?: number | null
  universal?: boolean | null
  options?: { value: string; label: string }[] | null
  min?: number | null
  max?: number | null
}

type TypeDoc = {
  id: number
  name: string
  parent?: number | TypeDoc | null
  specs?: (number | SpecDoc)[] | null
  keyFigures?: (number | SpecDoc)[] | null
}

type Values = Record<string, unknown>

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

async function getJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { credentials: 'include' })
  return res.ok ? ((await res.json()) as T) : null
}

const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * Spec editor for listings. Renders the fields of the selected vehicle type's spec profile
 * (universal specs + group specs + type specs), grouped in the fixed section order used on the website.
 * Values are stored in a JSON field and validated server-side against the spec definitions.
 */
export function SpecValuesField({ path }: { path: string }) {
  const { value, setValue } = useField<Values>({ path })
  const vehicleTypeId = useFormFields(([fields]) => idOf(fields.vehicleType?.value))
  const locale = useLocale()
  const [specs, setSpecs] = useState<SpecDoc[] | null>(null)
  const [profile, setProfile] = useState<{ keys: Set<string>; keyFigures: string[]; typeName: string } | null>(null)
  const [showAll, setShowAll] = useState(false)
  const values: Values = useMemo(() => (value && typeof value === 'object' ? value : {}), [value])

  useEffect(() => {
    getJSON<{ docs: SpecDoc[] }>(`/api/specs?limit=1000&pagination=false&depth=0&locale=${locale.code}`).then(
      (r) => setSpecs(r?.docs ?? []),
    )
  }, [locale.code])

  useEffect(() => {
    if (!vehicleTypeId || !specs) {
      setProfile(null)
      return
    }
    ;(async () => {
      const type = await getJSON<TypeDoc>(`/api/vehicle-types/${vehicleTypeId}?depth=0&locale=${locale.code}`)
      if (!type) return
      const parent = type.parent
        ? await getJSON<TypeDoc>(`/api/vehicle-types/${idOf(type.parent)}?depth=0&locale=${locale.code}`)
        : null
      const byId = new Map(specs.map((s) => [s.id, s]))
      const keys = new Set<string>(specs.filter((s) => s.universal).map((s) => s.key))
      for (const ref of [...(parent?.specs ?? []), ...(type.specs ?? [])]) {
        const s = byId.get(idOf(ref))
        if (s) keys.add(s.key)
      }
      const figureRefs = type.keyFigures?.length ? type.keyFigures : (parent?.keyFigures ?? [])
      const keyFigures = figureRefs.map((r) => byId.get(idOf(r))?.key).filter(Boolean) as string[]
      keyFigures.forEach((k) => keys.add(k))
      setProfile({ keys, keyFigures, typeName: parent ? `${parent.name} › ${type.name}` : type.name })
    })()
  }, [vehicleTypeId, specs, locale.code])

  const update = (key: string, next: unknown) => {
    const copy: Values = { ...values }
    if (isEmpty(next)) delete copy[key]
    else copy[key] = next
    setValue(copy)
  }

  if (!specs) return <div className="ecv-specs__loading">Loading spec definitions…</div>
  if (!vehicleTypeId) {
    return <div className="ecv-specs__hint">Choose a vehicle type on the “Vehicle” tab first. It decides which specs apply.</div>
  }
  if (!profile) return <div className="ecv-specs__loading">Loading the type’s spec profile…</div>

  const inProfile = specs.filter((s) => profile.keys.has(s.key) || showAll)
  const outside = specs.filter((s) => !profile.keys.has(s.key) && !isEmpty(values[s.key]))
  const filled = specs.filter((s) => profile.keys.has(s.key) && !isEmpty(values[s.key])).length
  const unknownKeys = Object.keys(values).filter((k) => !specs.some((s) => s.key === k))

  return (
    <div className="ecv-specs">
      <div className="ecv-specs__head">
        <div>
          <strong>{profile.typeName}</strong>: {filled} of {profile.keys.size} specs filled
          <div className="ecv-specs__bar">
            <span style={{ width: `${Math.round((filled / Math.max(1, profile.keys.size)) * 100)}%` }} />
          </div>
        </div>
        <label className="ecv-specs__toggle">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show all specs
        </label>
      </div>

      {SPEC_GROUPS.map((group) => {
        const rows = inProfile
          .filter((s) => s.group === group)
          .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
        if (!rows.length) return null
        return (
          <fieldset key={group} className="ecv-specs__group">
            <legend>{SPEC_GROUP_ADMIN_LABELS[group]}</legend>
            <div className="ecv-specs__grid">
              {rows.map((spec) => (
                <SpecInput
                  key={spec.key}
                  spec={spec}
                  value={values[spec.key]}
                  isKeyFigure={profile.keyFigures.includes(spec.key)}
                  outsideProfile={!profile.keys.has(spec.key)}
                  onChange={(v) => update(spec.key, v)}
                />
              ))}
            </div>
          </fieldset>
        )
      })}

      {!showAll && outside.length > 0 && (
        <fieldset className="ecv-specs__group ecv-specs__group--warn">
          <legend>Values outside this type’s profile (not shown on the website)</legend>
          <div className="ecv-specs__grid">
            {outside.map((spec) => (
              <SpecInput key={spec.key} spec={spec} value={values[spec.key]} outsideProfile onChange={(v) => update(spec.key, v)} />
            ))}
          </div>
        </fieldset>
      )}
      {unknownKeys.length > 0 && (
        <p className="ecv-specs__hint">
          Unknown keys will be removed on save: {unknownKeys.join(', ')}.
        </p>
      )}
    </div>
  )
}

function SpecInput({
  spec,
  value,
  isKeyFigure,
  outsideProfile,
  onChange,
}: {
  spec: SpecDoc
  value: unknown
  isKeyFigure?: boolean
  outsideProfile?: boolean
  onChange: (v: unknown) => void
}) {
  const id = `spec-${spec.key}`
  const [draft, setDraft] = useState<string>(value == null ? '' : String(value))
  useEffect(() => {
    setDraft(value == null ? '' : String(value))
  }, [value])

  const numberInvalid = spec.dataType === 'number' && draft !== '' && parseNumber(draft) == null
  const outOfRange =
    spec.dataType === 'number' &&
    typeof value === 'number' &&
    ((spec.min != null && value < spec.min) || (spec.max != null && value > spec.max))

  let control: React.ReactNode
  switch (spec.dataType) {
    case 'number':
      control = (
        <div className="ecv-specs__num">
          <input
            id={id}
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const n = parseNumber(draft)
              onChange(draft.trim() === '' ? null : (n ?? draft))
            }}
          />
          {spec.unit && <span className="ecv-specs__unit">{spec.unit}</span>}
        </div>
      )
      break
    case 'select':
      control = (
        <select id={id} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">—</option>
          {(spec.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
      break
    case 'multiselect': {
      const arr = Array.isArray(value) ? (value as string[]) : []
      control = (
        <div className="ecv-specs__chips" role="group" aria-labelledby={`${id}-label`}>
          {(spec.options ?? []).map((o) => {
            const on = arr.includes(o.value)
            return (
              <label key={o.value} className={`ecv-chip${on ? ' is-on' : ''}`}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                />
                {o.label}
              </label>
            )
          })}
        </div>
      )
      break
    }
    case 'boolean':
      control = (
        <select
          id={id}
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'true')}
        >
          <option value="">—</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )
      break
    case 'feature':
      control = (
        <div className="ecv-specs__seg" role="radiogroup" aria-labelledby={`${id}-label`}>
          {[
            ['', '—'],
            ['std', 'Standard'],
            ['opt', 'Optional'],
            ['no', 'Not available'],
          ].map(([v, label]) => (
            <label key={v} className={`ecv-chip${(value ?? '') === v ? ' is-on' : ''}`}>
              <input type="radio" name={id} checked={(value ?? '') === v} onChange={() => onChange(v || null)} />
              {label}
            </label>
          ))}
        </div>
      )
      break
    default:
      control = (
        <input
          id={id}
          value={draft}
          maxLength={200}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft.trim() || null)}
        />
      )
  }

  const wide = spec.dataType === 'multiselect' || spec.dataType === 'feature'
  return (
    <div className={`ecv-specs__field${wide ? ' is-wide' : ''}${outsideProfile ? ' is-outside' : ''}`}>
      <label id={`${id}-label`} htmlFor={id}>
        {spec.label}
        {isKeyFigure && <span className="ecv-badge" title="Shown as a key figure tile">Key figure</span>}
      </label>
      {control}
      {spec.help && <div className="ecv-specs__help">{spec.help}</div>}
      {numberInvalid && <div className="ecv-specs__err">Not a number</div>}
      {outOfRange && (
        <div className="ecv-specs__err">
          Outside the plausible range {spec.min ?? '–'}–{spec.max ?? '–'} {spec.unit}
        </div>
      )}
    </div>
  )
}
