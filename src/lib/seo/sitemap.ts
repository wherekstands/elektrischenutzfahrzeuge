import 'server-only'

import { DEFAULT_LOCALE, PUBLIC_LOCALES, type Locale } from '../../i18n/config'
import { getCatalog } from '../catalog'
import type { Catalog } from '../catalog/catalog'
import { MIN_LISTINGS_TO_INDEX_COMBO, MIN_LISTINGS_TO_INDEX_HUB } from '../constants'
import { getGuides, getPage } from '../content'
import { absolute, href, type Href, pathFor } from '../urls'

/** One URL entry: the same resource in each locale where it exists. */
export type SitemapEntry = { paths: Partial<Record<Locale, string>>; lastmod?: string | null }

export const SITEMAP_SECTIONS = ['pages', 'vehicles', 'types', 'jobs', 'brands', 'guides'] as const
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]

async function catalogs(): Promise<[Locale, Catalog][]> {
  return Promise.all(PUBLIC_LOCALES.map(async (l) => [l, await getCatalog(l)] as [Locale, Catalog]))
}

/** Build entries keyed by a stable id across locales. */
async function collect(build: (catalog: Catalog, locale: Locale) => { id: string; path: string; lastmod?: string | null }[]) {
  const map = new Map<string, SitemapEntry>()
  for (const [locale, catalog] of await catalogs()) {
    for (const e of build(catalog, locale)) {
      const entry = map.get(e.id) ?? { paths: {}, lastmod: null }
      entry.paths[locale] = e.path
      if (e.lastmod && (!entry.lastmod || e.lastmod > entry.lastmod)) entry.lastmod = e.lastmod
      map.set(e.id, entry)
    }
  }
  return [...map.values()]
}

/** Only indexable URLs (docs/03 §5): the same rules as the pages' robots meta. */
export async function sitemapEntries(section: SitemapSection): Promise<SitemapEntry[]> {
  switch (section) {
    case 'vehicles':
      return collect((c, l) =>
        c.listings.filter((x) => !x.seo.noindex).map((x) => ({ id: String(x.id), path: pathFor(l, href.vehicle(x.slug)), lastmod: x.updatedAt })),
      )
    case 'types':
      return collect((c, l) => [
        ...c.types
          .filter((t) => !t.seo.noindex && c.countForType(t) >= MIN_LISTINGS_TO_INDEX_HUB)
          .map((t) => ({ id: `t${t.id}`, path: pathFor(l, href.type(t, l)), lastmod: c.latestUpdate(c.listingsForType(t)) })),
        ...c.data.landings
          .filter((x) => x.hasLocale && !x.seo.noindex)
          .flatMap((x) => {
            const type = c.typeById.get(x.typeId)
            const job = c.jobById.get(x.jobId)
            if (!type || !job) return []
            const scope = c.listingsForJob(job, c.listingsForType(type))
            if (scope.length < MIN_LISTINGS_TO_INDEX_COMBO) return []
            return [{ id: `l${x.id}`, path: pathFor(l, href.type(type, l, job)), lastmod: c.latestUpdate(scope) }]
          }),
      ])
    case 'jobs':
      return collect((c, l) =>
        c.jobs
          .filter((j) => !j.seo.noindex && c.countForJob(j) >= MIN_LISTINGS_TO_INDEX_HUB)
          .map((j) => ({ id: `j${j.id}`, path: pathFor(l, href.job(j)), lastmod: c.latestUpdate(c.listingsForJob(j)) })),
      )
    case 'brands':
      return collect((c, l) =>
        c.activeBrands.map((b) => ({ id: `b${b.id}`, path: pathFor(l, href.brand(b.slug)), lastmod: c.latestUpdate(c.listingsForBrand(b)) })),
      )
    case 'guides': {
      const map = new Map<number, SitemapEntry>()
      for (const l of PUBLIC_LOCALES) {
        for (const g of await getGuides(l)) {
          const e = map.get(g.id) ?? { paths: {}, lastmod: g.updatedAt }
          e.paths[l] = pathFor(l, href.guide(g.slug))
          map.set(g.id, e)
        }
      }
      return [...map.values()]
    }
    case 'pages': {
      const [, catalog] = (await catalogs())[0]
      const latest = catalog.latestUpdate()
      const fixed: [string, Href, string | null][] = [
        ['home', href.home(), latest],
        ['vehicles', href.vehicles(), latest],
        ['types', href.types(), latest],
        ['jobs', href.jobs(), latest],
        ['brands', href.brands(), latest],
        ['guides', href.guides(), null],
      ]
      const pages: [string, Href][] = [
        ['about', href.about()],
        ['methodology', href.methodology()],
        ['how-ranking-works', href.ranking()],
        ['for-manufacturers', href.manufacturers()],
        ['imprint', href.imprint()],
        ['privacy', href.privacy()],
        ...(catalog.data.settings.openDataEnabled ? ([['data', href.data()]] as [string, Href][]) : []),
      ]
      const out: SitemapEntry[] = fixed.map(([, h, lastmod]) => ({
        paths: Object.fromEntries(PUBLIC_LOCALES.map((l) => [l, pathFor(l, h)])),
        lastmod,
      }))
      for (const [key, h] of pages) {
        const entry: SitemapEntry = { paths: {}, lastmod: null }
        for (const l of PUBLIC_LOCALES) {
          const page = await getPage(l, key)
          if (page && !page.seo.noindex) {
            entry.paths[l] = pathFor(l, h)
            if (!entry.lastmod || page.updatedAt > entry.lastmod) entry.lastmod = page.updatedAt
          }
        }
        if (Object.keys(entry.paths).length) out.push(entry)
      }
      return out
    }
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : undefined)

/** <urlset> with xhtml:link hreflang alternates (incl. x-default) for every locale version. */
export function renderUrlset(entries: SitemapEntry[]): string {
  const urls: string[] = []
  for (const e of entries) {
    const locales = Object.keys(e.paths) as Locale[]
    const alternates = locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(absolute(e.paths[l]!))}"/>`)
    const xDefault = e.paths[DEFAULT_LOCALE] ?? e.paths[locales[0]]
    if (xDefault) alternates.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${esc(absolute(xDefault))}"/>`)
    for (const l of locales) {
      const lastmod = day(e.lastmod)
      urls.push(
        `<url><loc>${esc(absolute(e.paths[l]!))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${alternates.join('')}</url>`,
      )
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

export function renderIndex(items: { loc: string; lastmod?: string | null }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items
    .map((i) => `<sitemap><loc>${esc(i.loc)}</loc>${i.lastmod ? `<lastmod>${day(i.lastmod)}</lastmod>` : ''}</sitemap>`)
    .join('\n')}\n</sitemapindex>\n`
}
