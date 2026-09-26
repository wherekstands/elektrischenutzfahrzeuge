import { INDEXNOW_KEY } from '@/lib/env'

/** IndexNow key file referenced as keyLocation in pings (src/lib/indexnow.ts). */
export const dynamic = 'force-static'

export function GET() {
  if (!INDEXNOW_KEY) return new Response('Not found', { status: 404 })
  return new Response(INDEXNOW_KEY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
