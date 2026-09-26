import { isPublicLocale, PUBLIC_LOCALES, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { href, pathFor } from '@/lib/urls'

/**
 * Compact index for the header search (loaded on first focus): [label, path, keywords, context].
 * Static and revalidated with the catalogue.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return PUBLIC_LOCALES.map((locale) => ({ locale }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isPublicLocale(locale)) return new Response('Not found', { status: 404 })
  const catalog = await getCatalog(locale as Locale)
  const l = locale as Locale
  const body = {
    v: catalog.listings.map((x) => {
      const type = catalog.typeOf(x)
      return [x.title, pathFor(l, href.vehicle(x.slug)), [x.family, ...type.synonyms].filter(Boolean).join(' '), type.name]
    }),
    t: catalog.types
      .filter((x) => catalog.countForType(x) > 0)
      .map((x) => [x.name, pathFor(l, href.type(x, l)), x.synonyms.join(' '), x.parentId ? catalog.typeById.get(x.parentId)?.name ?? '' : '']),
    j: catalog.jobs
      .filter((x) => catalog.countForJob(x) > 0)
      .map((x) => [x.name, pathFor(l, href.job(x)), x.synonyms.join(' '), x.parentId ? catalog.jobById.get(x.parentId)?.name ?? '' : '']),
    b: catalog.activeBrands.map((b) => [b.name, pathFor(l, href.brand(b.slug)), b.country ?? '']),
  }
  return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400' } })
}
