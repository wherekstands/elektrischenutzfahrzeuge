import { expect, type Locator, type Page } from '@playwright/test'

/** Every JSON-LD block on the page, parsed. Fails the test on invalid JSON. */
export async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  const out: Record<string, unknown>[] = []
  for (const raw of blocks) {
    let parsed: unknown
    expect(() => (parsed = JSON.parse(raw)), `invalid JSON-LD: ${raw.slice(0, 200)}`).not.toThrow()
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) out.push(item as Record<string, unknown>)
  }
  return out
}

export const typesOf = (items: Record<string, unknown>[]) =>
  items.flatMap((i) => (Array.isArray(i['@type']) ? (i['@type'] as string[]) : [i['@type'] as string]))

/** Slug of the first vehicle linked from the browse page. */
export async function firstVehicleSlug(page: Page): Promise<string> {
  await page.goto('/en/vehicles')
  const hrefAttr = await page.locator('article a[href^="/en/vehicles/"]').first().getAttribute('href')
  expect(hrefAttr).toBeTruthy()
  return hrefAttr!.split('/').pop()!
}

/**
 * Click a client-side toggle until it reports the expected state. Clicks that land before React has
 * hydrated the page are lost (mostly in `next dev`), so retry instead of sleeping.
 */
export async function clickToggle(button: Locator, pressed = 'true') {
  await expect(async () => {
    if ((await button.getAttribute('aria-pressed')) !== pressed) await button.click()
    await expect(button).toHaveAttribute('aria-pressed', pressed, { timeout: 1500 })
  }).toPass({ timeout: 20_000 })
}
