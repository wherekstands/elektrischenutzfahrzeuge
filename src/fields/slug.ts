import type { Field, FieldHook } from 'payload'

/** Lowercase ASCII with hyphens (docs/03 §1). Transliterates German umlauts and common accents. */
export const slugify = (input: string): string =>
  input
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const validateSlug = (value: unknown): true | string => {
  if (value == null || value === '') return true
  if (typeof value !== 'string' || !SLUG_PATTERN.test(value))
    return 'Use lowercase letters, digits and single hyphens only (e.g. "street-sweepers").'
  if (value === 'for' || value === 'fuer') return '"for" is reserved for type × job pages.'
  return true
}

type SlugOptions = {
  /** Field(s) the slug is generated from when left empty. */
  from: string | string[]
  localized?: boolean
  unique?: boolean
  /** Help text in the admin. */
  description?: string
}

/**
 * Slug field: generated from `from` on create when empty, then stable. Slugs never change silently;
 * editors can change them deliberately, and listing/brand/guide hooks record a redirect when they do.
 */
export const slugField = ({ from, localized = false, unique = true, description }: SlugOptions): Field => {
  const sources = Array.isArray(from) ? from : [from]
  const generate: FieldHook = ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const parts = sources
      .map((key) => (data?.[key] ?? originalDoc?.[key]) as unknown)
      .map((v) => (typeof v === 'object' && v && 'name' in v ? (v as { name: string }).name : v))
      .filter((v): v is string => typeof v === 'string' && v.length > 0)
    return parts.length ? slugify(parts.join(' ')) : value
  }
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique,
    localized,
    validate: validateSlug,
    admin: {
      position: 'sidebar',
      description:
        description ??
        'URL segment. Generated from the name if empty. Changing it later creates a redirect from the old URL.',
    },
    hooks: { beforeValidate: [generate] },
  }
}
