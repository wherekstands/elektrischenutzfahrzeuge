// Dev helper: print browser console errors for a page. node scripts/console-check.mjs /en/...
import { chromium } from '@playwright/test'
const [, , path = '/en'] = process.argv
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
const msgs = []
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) msgs.push(`[${m.type()}] ${m.text().slice(0, 600)}`) })
page.on('pageerror', (e) => msgs.push(`[pageerror] ${e.message.slice(0, 600)}`))
await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(1500)
console.log(msgs.length ? msgs.join('\n---\n') : 'no console errors')
await browser.close()
