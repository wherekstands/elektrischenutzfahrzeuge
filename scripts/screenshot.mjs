// Dev helper (BASE_URL overrides http://localhost:3000): node scripts/screenshot.mjs <path> <out.png> [width=1360] [full=0] [clipY] [clipH] [scale=1]
import { chromium } from '@playwright/test'

const [, , path = '/en', out = '.shots/shot.png', width = '1360', full = '0', clipY, clipH, scale = '1'] = process.argv
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: Number(scale) })
const base = process.env.BASE_URL || 'http://localhost:3000'
const res = await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 120000 })
console.log(res?.status(), path, await page.evaluate(() => document.body.scrollHeight))
if (clipY) {
  await page.screenshot({ path: out, fullPage: true, clip: { x: 0, y: Number(clipY), width: Number(width), height: Number(clipH || 900) } })
} else {
  await page.screenshot({ path: out, fullPage: full === '1' })
}
await browser.close()
