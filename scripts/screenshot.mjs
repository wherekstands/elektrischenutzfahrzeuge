// Dev helper: node scripts/screenshot.mjs <path> <out.png> [width] [fullPage]
import { chromium } from '@playwright/test'

const [, , path = '/en', out = '.shots/shot.png', width = '1360', full = '0'] = process.argv
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 })
const res = await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 120000 })
console.log(res?.status(), path)
await page.screenshot({ path: out, fullPage: full === '1' })
await browser.close()
