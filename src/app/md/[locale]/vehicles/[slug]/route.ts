import { isPublicLocale, PUBLIC_LOCALES, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { listingMarkdown } from '@/lib/seo/markdown'
import { absolute, href, pathFor } from '@/lib/urls'

/**
 * Markdown twin of each vehicle page, served at /<locale>/vehicles/<slug>.md (rewritten by src/proxy.ts).
 * The HTML page is the canonical (HTTP Link header), so search engines do not treat this as a duplicate.
 */
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const out: { locale: string; slug: string }[] = []
  for (const locale of PUBLIC_LOCALES) {
    const catalog = await getCatalog(locale)
    for (const l of catalog.listings) out.push({ locale, slug: l.slug })
  }
  return out
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isPublicLocale(locale)) return new Response('Not found', { status: 404 })
  const catalog = await getCatalog(locale as Locale)
  const listing = catalog.listingBySlug.get(slug)
  if (!listing) return new Response('Not found', { status: 404 })
  const body = await listingMarkdown(listing, catalog, locale as Locale)
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${absolute(pathFor(locale as Locale, href.vehicle(slug)))}>; rel="canonical"`,
    },
  })
}
