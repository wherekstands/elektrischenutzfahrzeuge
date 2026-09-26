import { renderUrlset, SITEMAP_SECTIONS, type SitemapSection, sitemapEntries } from '@/lib/seo/sitemap'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return SITEMAP_SECTIONS.map((s) => ({ name: `${s}.xml` }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const section = name.replace(/\.xml$/, '') as SitemapSection
  if (!SITEMAP_SECTIONS.includes(section)) return new Response('Not found', { status: 404 })
  return new Response(renderUrlset(await sitemapEntries(section)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
