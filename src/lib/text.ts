import type { Locale } from '../i18n/config'

/** "Small vans" → "small vans" in running English text; keeps acronyms ("UTVs") and German nouns intact. */
export function lcFirst(name: string, locale: Locale): string {
  if (locale !== 'en' || name.length < 2) return name
  return /^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name
}
