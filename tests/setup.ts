import { vi } from 'vitest'

// `server-only` throws outside React Server Components; unit tests import server modules directly.
vi.mock('server-only', () => ({}))
