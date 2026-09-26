import { SITE_URL } from '@/lib/env'
import { renderIndex, SITEMAP_SECTIONS, sitemapEntries } from '@/lib/seo/sitemap'

/** Sitemap index of per-section sitemaps (docs/03 §5). Static, revalidated with the catalogue. */
export const dynamic = 'force-static'

export async function GET() {
  const items = await Promise.all(
    SITEMAP_SECTIONS.map(async (s) => {
      const entries = await sitemapEntries(s)
      const lastmod = entries.reduce<string | null>((m, e) => (e.lastmod && (!m || e.lastmod > m) ? e.lastmod : m), null)
      return { loc: `${SITE_URL}/sitemaps/${s}.xml`, lastmod, count: entries.length }
    }),
  )
  return new Response(renderIndex(items.filter((i) => i.count > 0)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
