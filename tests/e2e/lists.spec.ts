import { expect, type Page, test } from '@playwright/test'

import { clickToggle } from './helpers'

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Add the next vehicle that is not yet in the comparison. The same vehicle can appear twice on a
 * hub (featured slot and results), so pick by title and keep a locator that survives the toggle.
 */
async function addNextToCompare(page: Page) {
  const next = page.locator('article').getByRole('button', { name: /^Add .* to comparison$/ }).first()
  const title = (await next.getAttribute('aria-label'))!.replace(/^Add (.*) to comparison$/, '$1')
  const button = page
    .locator('article')
    .getByRole('button', { name: new RegExp(`^(Add ${escape(title)} to|Remove ${escape(title)} from) comparison$`) })
    .first()
  await clickToggle(button)
  return title
}

test.describe('compare and saved lists', () => {
  test('compare two vehicles and show differences only', async ({ page }) => {
    await page.goto('/en/types/vans')
    await addNextToCompare(page)
    await addNextToCompare(page)
    await page.getByRole('region', { name: 'Comparison' }).getByRole('link', { name: 'Compare 2/4' }).click()
    await expect(page).toHaveURL(/\/en\/compare\?ids=/)
    await expect(page.locator('table thead th, table thead td').filter({ has: page.locator('a') })).toHaveCount(2)
    await page.getByText('Differences only').click()
    await expect(page.locator('[data-diff="1"]')).toHaveCount(1)
  })

  test('compare holds at most four vehicles', async ({ page }) => {
    await page.goto('/en/vehicles')
    for (let i = 0; i < 4; i++) await addNextToCompare(page)
    await page.locator('article').getByRole('button', { name: /^Add .* to comparison$/ }).first().click()
    await expect(page.getByRole('status').filter({ hasText: 'up to four' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Compare 4\/4/ })).toBeVisible()
  })

  test('save a vehicle to the saved list @mobile', async ({ page }) => {
    await page.goto('/en/vehicles')
    const save = page.locator('article').getByRole('button', { name: /^Save |from saved$/ }).first()
    const label = (await save.getAttribute('aria-label'))!.replace(/^Save /, '')
    await clickToggle(save)
    await page.goto('/en/saved')
    await expect(page.getByRole('button', { name: `Remove ${label} from saved` })).toBeVisible()
  })
})

test.describe('ranking transparency', () => {
  test('sort control links to how ranking works', async ({ page }) => {
    await page.goto('/en/vehicles')
    await expect(page.locator('a[href="/en/how-ranking-works"]').first()).toBeVisible()
  })

  test('paid positions are labelled in the recommended order', async ({ page }) => {
    await page.goto('/en/vehicles')
    const sponsored = page.locator('article').filter({ hasText: /Sponsored/ })
    const count = await sponsored.count()
    // With demo data there are sponsored listings; without, there must be none unlabelled — both are fine.
    if (count) await expect(sponsored.first()).toBeVisible()
    await page.goto('/en/vehicles?sort=name')
    await expect(page.locator('article').filter({ hasText: /Sponsored/ })).toHaveCount(0)
  })
})
