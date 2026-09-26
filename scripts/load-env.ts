/** Load .env for CLI scripts (Node 22+). Import this before anything that reads process.env. */
try {
  process.loadEnvFile('.env')
} catch {
  // No .env file: variables come from the environment (CI, Vercel).
}
