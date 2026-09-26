import { isPublicLocale, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { SITE_NAME } from '@/lib/env'
import { absoluteFor, href } from '@/lib/urls'

/**
 * Open dataset (docs/03 §6): /data/vehicles.<locale>.json and .csv. Only when enabled in Settings.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const m = /^vehicles\.([a-z]{2})\.(json|csv)$/.exec(file)
  if (!m || !isPublicLocale(m[1])) return new Response('Not found', { status: 404 })
  const locale = m[1] as Locale
  const c = await getCatalog(locale)
  if (!c.data.settings.openDataEnabled) return new Response('Not found', { status: 404 })
  const licence = c.data.settings.openDataLicence ?? 'CC BY 4.0'
  const rows = c.listings.map((l) => ({
    slug: l.slug,
    url: absoluteFor(locale, href.vehicle(l.slug)),
    brand: c.brandOf(l).name,
    model: l.model,
    type: c.typeOf(l).name,
    group: c.groupOf(c.typeOf(l)).name,
    jobs: c.jobsOf(l).map((j) => j.name),
    availability: l.availability,
    confirmedByManufacturer: c.isVerified(l) ? l.verifiedAt : null,
    updatedAt: l.updatedAt,
    specs: l.specs,
  }))
  const headers = { 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' }
  if (m[2] === 'json') {
    return Response.json({ source: SITE_NAME, licence, generatedAt: c.data.generatedAt, units: Object.fromEntries(c.specs.map((s) => [s.key, s.unit])), vehicles: rows }, { headers })
  }
  const specKeys = c.specs.map((s) => s.key)
  const esc = (v: unknown) => {
    const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const head = ['slug', 'url', 'brand', 'model', 'type', 'group', 'jobs', 'availability', 'confirmed_by_manufacturer', 'updated_at', ...specKeys]
  const lines = [head.join(',')]
  for (const r of rows) {
    lines.push([r.slug, r.url, r.brand, r.model, r.type, r.group, r.jobs, r.availability, r.confirmedByManufacturer, r.updatedAt, ...specKeys.map((k) => r.specs[k])].map(esc).join(','))
  }
  return new Response(lines.join('\n'), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8' } })
}
