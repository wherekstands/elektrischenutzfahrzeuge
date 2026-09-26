import { vi } from 'vitest'

try {
  process.loadEnvFile('.env')
} catch {
  // CI provides the variables directly.
}

vi.mock('server-only', () => ({}))
