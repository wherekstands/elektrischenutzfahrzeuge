import { expect, test } from '@playwright/test'

import { firstVehicleSlug, jsonLd, typesOf } from './helpers'

test.describe('URLs and redirects', () => {
  test('the root redirects permanently to /en', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(res.headers().location).toMatch(/\/en$/)
  })

  test('no Accept-Language redirect', async ({ request }) => {
    const res = await request.get('/en', { headers: { 'Accept-Language': 'de-DE,de;q=0.9' }, maxRedirects: 0 })
    expect(res.status()).toBe(200)
  })

  test('a single type facet redirects to the type hub', async ({ request }) => {
    const res = await request.get('/en/vehicles?type=vans', { maxRedirects: 0 })
    expect([301, 308]).toContain(res.status())
    expect(res.headers().location).toContain('/en/types/vans')
  })

  test('unknown pages return 404', async ({ request }) => {
    expect((await request.get('/en/vehicles/does-not-exist')).status()).toBe(404)
    expect((await request.get('/en/nothing-here')).status()).toBe(404)
  })
})

test.describe('metadata', () => {
  test('hub: canonical, hreflang, title and description limits', async ({ page }) => {
    await page.goto('/en/types/vans')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/types\/vans$/)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
    expect((await page.title()).length).toBeLessThanOrEqual(60)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description?.length ?? 0).toBeGreaterThan(50)
    expect(description!.length).toBeLessThanOrEqual(155)
    expect(typesOf(await jsonLd(page))).toEqual(expect.arrayContaining(['BreadcrumbList', 'CollectionPage']))
  })

  test('faceted URLs are noindex,follow with a canonical to the hub', async ({ page }) => {
    await page.goto('/en/types/vans?range_min=100&sort=range-desc')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex.*follow/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/types\/vans$/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('vehicle page: product JSON-LD, Markdown twin, facts and correction link', async ({ page, request }) => {
    const slug = await firstVehicleSlug(page)
    await page.goto(`/en/vehicles/${slug}`)
    await expect(page.locator('h1')).toHaveCount(1)
    const title = await page.title()
    expect(title.length).toBeLessThanOrEqual(60)

    const ld = await jsonLd(page)
    const types = typesOf(ld)
    expect(types.some((t) => t === 'Product' || t === 'ProductModel')).toBe(true)
    expect(types).toEqual(expect.arrayContaining(['BreadcrumbList', 'ItemPage']))
    const product = ld.find((i) => typesOf([i]).some((t) => t === 'Product' || t === 'ProductModel'))!
    expect(product.name).toBeTruthy()
    expect(Array.isArray(product.additionalProperty)).toBe(true)
    if (product.offers) expect(product.offers).toMatchObject({ priceCurrency: 'EUR' })
    expect(JSON.stringify(ld)).not.toMatch(/aggregateRating|"review"/)

    const md = page.locator('link[rel="alternate"][type="text/markdown"]')
    await expect(md).toHaveCount(1)
    const mdRes = await request.get(`/en/vehicles/${slug}.md`)
    expect(mdRes.status()).toBe(200)
    expect(mdRes.headers()['content-type']).toContain('text/markdown')
    expect(await mdRes.text()).toMatch(/^# /)

    await expect(page.getByRole('link', { name: /suggest a correction/i }).first()).toBeVisible()
  })

  test('JSON-LD parses on every page type', async ({ page }) => {
    const slug = await firstVehicleSlug(page)
    for (const path of ['/en', '/en/vehicles', '/en/types', '/en/jobs', '/en/brands', `/en/vehicles/${slug}`, '/en/guides', '/en/about', '/en/how-ranking-works']) {
      await page.goto(path)
      const ld = await jsonLd(page)
      expect(ld.length, path).toBeGreaterThan(0)
      for (const item of ld) expect(item['@context'] ?? item['@type'], path).toBeTruthy()
    }
  })
})

test.describe('crawler files', () => {
  test('robots.txt names AI crawlers and the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text()
    // Preview and local builds block everything (ALLOW_INDEXING unset); CI builds with ALLOW_INDEXING=true.
    test.skip(/^Disallow: \/$/m.test(txt) && !txt.includes('Allow: /'), 'indexing disabled for this build')
    for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'GPTBot', 'Google-Extended']) expect(txt).toContain(bot)
    expect(txt).toMatch(/Sitemap: .*\/sitemap\.xml/)
  })

  test('sitemap index lists section sitemaps with hreflang', async ({ request }) => {
    const index = await (await request.get('/sitemap.xml')).text()
    expect(index).toContain('<sitemapindex')
    const first = /<loc>([^<]+)<\/loc>/.exec(index)![1]
    const section = await (await request.get(new URL(first).pathname)).text()
    expect(section).toContain('<urlset')
    expect(section).toContain('xhtml:link')
    expect(section).toContain('<lastmod>')
  })

  test('llms.txt describes the site', async ({ request }) => {
    const res = await request.get('/llms.txt')
    expect(res.status()).toBe(200)
    expect(await res.text()).toMatch(/^# /)
  })
})
