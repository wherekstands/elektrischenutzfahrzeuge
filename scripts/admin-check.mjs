// Dev helper: log into the admin and screenshot a listing's spec editor.
import { chromium } from '@playwright/test'
const email = process.env.SEED_ADMIN_EMAIL || 'admin@ecvbase.local'
const password = process.env.SEED_ADMIN_PASSWORD || 'admin-local-1234'
const [, , target = '/admin/collections/listings', out = '.shots/admin.png', tab = ''] = process.argv
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 180000 })
await page.fill('input[name="email"]', email)
await page.fill('input[name="password"]', password)
await page.click('button[type="submit"]')
await page.waitForURL(/\/admin(?!\/login)/, { timeout: 120000 })
await page.goto(`http://localhost:3000${target}`, { waitUntil: 'networkidle', timeout: 180000 })
if (tab) {
  await page.getByRole('button', { name: tab, exact: true }).first().click()
  await page.waitForTimeout(2500)
}
await page.screenshot({ path: out, fullPage: false })
console.log('ok', page.url(), errors.slice(0, 3))
await browser.close()
