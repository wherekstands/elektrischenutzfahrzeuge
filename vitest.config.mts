import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    // next-intl imports `next/navigation` without an extension; let Vite resolve it.
    server: { deps: { inline: ['next-intl'] } },
  },
})
