import type { MetadataRoute } from 'next'

import { PUBLIC_LOCALES } from '@/i18n/config'
import { ALLOW_INDEXING, SITE_URL } from '@/lib/env'
import { href, pathFor } from '@/lib/urls'

/**
 * AI crawlers are allowed explicitly (docs/03 §5): the goal is to be read and cited by LLM answer engines.
 * Allowing training crawlers is a business decision; the default here is allow.
 * Also check that neither the Vercel Firewall nor a CDN "block AI bots" setting blocks them.
 */
export const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Bingbot',
  'Googlebot',
  'Applebot',
  'DuckAssistBot',
]
export const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent']

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    // Preview deployments and local builds: keep everything out of search engines.
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  const disallow = ['/admin', '/api/', '/next/', ...PUBLIC_LOCALES.map((l) => pathFor(l, href.saved()))]
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: [...AI_SEARCH_BOTS, ...AI_TRAINING_BOTS], allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
