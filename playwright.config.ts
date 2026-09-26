import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke tests against a running site with seeded data (`pnpm seed`).
 * Locally: `pnpm dev` (or `pnpm build && pnpm start`), then `pnpm test:e2e`.
 * E2E_BASE_URL points the tests at another deployment (e.g. a Vercel preview).
 */
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const preinstalled = '/opt/pw-browsers/chromium'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: existsSync(preinstalled) && !process.env.CI ? { executablePath: preinstalled } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? 'pnpm start' : 'pnpm dev',
        url: `${baseURL}/en`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
