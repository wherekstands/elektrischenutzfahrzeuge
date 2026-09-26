import { INDEXNOW_KEY, IS_PRODUCTION_DEPLOYMENT, SITE_URL } from './env'

/**
 * Ping IndexNow (Bing, Yandex, Seznam, Naver; shared with other engines) when public URLs change.
 * Only on the production deployment and only when INDEXNOW_KEY is set. Never throws.
 * Key file: /indexnow-key.txt (src/app/indexnow-key.txt/route.ts).
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!IS_PRODUCTION_DEPLOYMENT || !INDEXNOW_KEY || paths.length === 0) return
  const host = new URL(SITE_URL).host
  const urlList = [...new Set(paths)].map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p}`))
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: urlList.slice(0, 10000),
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Best effort: sitemaps remain the source of truth.
  }
}
