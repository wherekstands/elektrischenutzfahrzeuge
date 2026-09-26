import { expect, test } from '@playwright/test'

/**
 * Publishing in the CMS must refresh statically generated pages right away (revalidateTag) and never
 * break them: a regression here once turned every page into a 404 after the first publish.
 * Needs an admin account: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (CI uses the seed admin).
 */
const email = process.env.E2E_ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD

test.describe.configure({ mode: 'serial' })
test.skip(!email || !password, 'no admin credentials for the CMS API')

test('publishing a change updates the static vehicle page, hubs keep working', async ({ page, request }) => {
  const login = await request.post('/api/users/login', { data: { email, password } })
  expect(login.ok()).toBe(true)
  const { token } = (await login.json()) as { token: string }
  const auth = { Authorization: `JWT ${token}` }

  await page.goto('/en/vehicles')
  const slug = (await page.locator('article a[href^="/en/vehicles/"]').first().getAttribute('href'))!.split('/').pop()!
  const found = await request.get(`/api/listings?where[slug][equals]=${slug}&depth=0`, { headers: auth })
  const listing = ((await found.json()) as { docs: { id: number; summary: string }[] }).docs[0]
  const marker = `E2E-${Date.now()}`

  const publish = (summary: string) =>
    request.patch(`/api/listings/${listing.id}`, { headers: auth, data: { summary, _status: 'published' } })

  try {
    expect((await publish(`${marker} ${listing.summary}`)).ok()).toBe(true)
    await expect(async () => {
      const res = await request.get(`/en/vehicles/${slug}`)
      expect(res.status()).toBe(200)
      expect(await res.text()).toContain(marker)
    }).toPass({ timeout: 20_000 })
    for (const path of ['/en', '/en/vehicles', '/en/types', `/en/vehicles/${slug}.md`]) {
      expect((await request.get(path)).status(), path).toBe(200)
    }
  } finally {
    await publish(listing.summary)
  }
})
