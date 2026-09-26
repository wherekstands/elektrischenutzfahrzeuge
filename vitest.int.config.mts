import { defineConfig } from 'vitest/config'

/** Integration tests against a real Postgres (DATABASE_URL). Run with `pnpm test:int`. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/int/**/*.int.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 180_000,
    fileParallelism: false,
    setupFiles: ['./tests/int/setup.ts'],
    server: { deps: { inline: ['next-intl'] } },
  },
})
