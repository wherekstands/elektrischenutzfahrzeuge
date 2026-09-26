import { PUBLIC_LOCALES, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import type { Catalog } from '@/lib/catalog/catalog'

export { lcFirst } from '@/lib/text'

/**
 * hreflang: the path of the same entity in every published locale where it exists (docs/03 §8).
 * `build` returns null when the entity has no localized version.
 */
export async function alternates(
  build: (catalog: Catalog, locale: Locale) => string | null,
): Promise<Partial<Record<Locale, string>>> {
  const out: Partial<Record<Locale, string>> = {}
  for (const l of PUBLIC_LOCALES) {
    const path = build(await getCatalog(l), l)
    if (path) out[l] = path
  }
  return out
}
