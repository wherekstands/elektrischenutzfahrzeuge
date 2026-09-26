import { DEFAULT_LOCALE } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { SITE_NAME, SITE_URL } from '@/lib/env'
import { absoluteFor, href } from '@/lib/urls'

/** llms.txt (llmstxt.org): what the site is, how data is compiled, and where the main content lives. */
export const dynamic = 'force-static'

export async function GET() {
  const locale = DEFAULT_LOCALE
  const c = await getCatalog(locale)
  const u = (h: Parameters<typeof absoluteFor>[1]) => absoluteFor(locale, h)
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> Independent directory of electric commercial vehicles and machines for Europe: ${c.listings.length} models from ${c.activeBrands.length} brands, including vans, trucks, buses, municipal, construction, agricultural and industrial machines. Specifications, prices where published, and direct manufacturer contacts.`,
    '',
    'Data is compiled from public manufacturer sources (product pages, data sheets, press releases). Every listing states its source and last update; "Data confirmed by <brand>" means the manufacturer reviewed the data on the date shown. Spec values are never estimated; missing values are marked "Not published". Payment never changes spec values; paid visibility is labelled.',
    '',
    `Every vehicle page has a Markdown version: append \`.md\` to its URL (e.g. ${u(href.vehicle(c.listings[0]?.slug ?? 'example'))}.md).`,
    '',
    '## Main pages',
    '',
    `- [All vehicles](${u(href.vehicles())}): filterable list of every model`,
    `- [Vehicle types](${u(href.types())}): all vehicle types`,
    `- [Jobs](${u(href.jobs())}): vehicles by application`,
    `- [Brands](${u(href.brands())}): all manufacturers`,
    `- [Guides](${u(href.guides())}): buyer guides`,
    '',
    '## Vehicle types',
    '',
    ...c.types
      .filter((t) => c.countForType(t) > 0)
      .map((t) => `- [${t.name}](${u(href.type(t, locale))}): ${c.countForType(t)} models${t.shortDescription ? `. ${t.shortDescription}` : ''}`),
    '',
    '## Jobs',
    '',
    ...c.jobs.filter((j) => c.countForJob(j) > 0).map((j) => `- [${j.name}](${u(href.job(j))}): ${c.countForJob(j)} models`),
    '',
    '## Trust and methodology',
    '',
    `- [Methodology](${u(href.methodology())}): sources, definitions, corrections`,
    `- [How ranking works](${u(href.ranking())}): ranking parameters and paid visibility`,
    `- [About](${u(href.about())})`,
    ...(c.data.settings.openDataEnabled ? [`- [Open data](${u(href.data())}): JSON and CSV downloads (${c.data.settings.openDataLicence ?? 'CC BY 4.0'})`] : []),
    '',
    '## Optional',
    '',
    `- [All vehicles with key figures](${SITE_URL}/llms-full.txt): one paragraph per model`,
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
