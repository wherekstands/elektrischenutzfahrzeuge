import 'server-only'

import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Locale } from '../../i18n/config'
import { CATALOG_TAG } from '../constants'
import { Catalog } from './catalog'
import { loadCatalog } from './load'
import type { CatalogData } from './types'

export { Catalog } from './catalog'

/**
 * Caching strategy (see docs/architecture.md):
 *
 * The Next.js data cache is limited to 2 MB per entry, which a catalogue of ~1,500 listings can exceed.
 * So the data cache only holds a tiny *version stamp*, tagged `catalog`. Each server instance keeps the
 * full catalogue in memory and reloads it from Postgres when the stamp changes:
 *
 *  - publishing anything calls revalidateTag('catalog') → new stamp → every instance reloads once;
 *  - the stamp also rolls every hour, so expiring partnerships and placements disappear on time;
 *  - pages that read the catalogue are tagged `catalog` too, so static pages regenerate on publish.
 */
const getVersion = unstable_cache(async () => new Date().toISOString(), ['catalog-version', 'v1'], {
  tags: [CATALOG_TAG],
  revalidate: 3600,
})

type Entry = { version: string; catalog?: Catalog; loading?: Promise<Catalog> }
const memory = new Map<Locale, Entry>()

async function isDraftMode() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false // outside a request (e.g. generateStaticParams)
  }
}

async function load(locale: Locale): Promise<Catalog> {
  const version = await getVersion()
  const entry = memory.get(locale)
  if (entry?.version === version) {
    if (entry.catalog) return entry.catalog
    if (entry.loading) return entry.loading
  }
  const loading = loadCatalog(locale).then((data: CatalogData) => {
    const catalog = new Catalog(data)
    const current = memory.get(locale)
    if (current?.version === version) memory.set(locale, { version, catalog })
    return catalog
  })
  memory.set(locale, { version, loading })
  try {
    return await loading
  } catch (err) {
    memory.delete(locale)
    throw err
  }
}

/** The catalogue for a locale. Deduplicated per request; draft mode sees unpublished changes. */
export const getCatalog = cache(async (locale: Locale): Promise<Catalog> => {
  if (await isDraftMode()) return new Catalog(await loadCatalog(locale, { drafts: true }))
  return load(locale)
})
