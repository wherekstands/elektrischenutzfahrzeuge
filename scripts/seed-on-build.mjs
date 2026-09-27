/**
 * Part of `pnpm ci` (the Vercel build command), between migrations and `next build`.
 * Loads the initial data into an EMPTY database so a fresh Supabase project needs no manual step.
 * Off unless SEED_ON_BUILD is set:
 *   SEED_ON_BUILD=demo  development/preview projects: real listings plus fictional demo partners
 *                       (refused on production by scripts/seed.ts)
 *   SEED_ON_BUILD=real  real data only (taxonomy, specs, reference listings, pages)
 * A database that already has listings is never touched.
 */
import { spawnSync } from 'node:child_process'

const mode = process.env.SEED_ON_BUILD
if (!mode) process.exit(0)
if (mode !== 'demo' && mode !== 'real') {
  console.error(`SEED_ON_BUILD must be "demo" or "real", got "${mode}"`)
  process.exit(1)
}
const args = ['exec', 'tsx', 'scripts/seed.ts', '--if-empty', ...(mode === 'demo' ? ['--demo'] : [])]
const result = spawnSync('pnpm', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
