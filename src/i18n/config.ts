/**
 * Locale configuration.
 *
 * - `ALL_LOCALES`: locales the CMS stores content for and the router knows. German paths are prepared.
 * - `PUBLIC_LOCALES`: locales that are live on the website. Enable German by setting
 *   NEXT_PUBLIC_LOCALES=en,de once UI strings and content are reviewed (docs/03 §8). No code change needed.
 */
export const ALL_LOCALES = ['en', 'de'] as const
export type Locale = (typeof ALL_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

const requested = (process.env.NEXT_PUBLIC_LOCALES || 'en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

export const PUBLIC_LOCALES: Locale[] = ALL_LOCALES.filter((l) => requested.includes(l))
if (!PUBLIC_LOCALES.includes(DEFAULT_LOCALE)) PUBLIC_LOCALES.unshift(DEFAULT_LOCALE)

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (ALL_LOCALES as readonly string[]).includes(value)

export const isPublicLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (PUBLIC_LOCALES as readonly string[]).includes(value)

/** BCP 47 tags used for Intl formatting, `<html lang>` and Open Graph locale. */
export const INTL_LOCALE: Record<Locale, string> = { en: 'en-GB', de: 'de-DE' }
export const OG_LOCALE: Record<Locale, string> = { en: 'en_GB', de: 'de_DE' }

/** The localized path segment between a type and a job on curated type × job pages. */
export const COMBO_SEGMENT: Record<Locale, string> = { en: 'for', de: 'fuer' }
