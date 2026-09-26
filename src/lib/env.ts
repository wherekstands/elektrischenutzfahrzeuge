/**
 * Typed access to environment variables. Only NEXT_PUBLIC_* values are available in client components.
 */

const trimSlash = (s: string) => s.replace(/\/+$/, '')

/** Canonical origin, e.g. https://elektrischenutzfahrzeuge.de (no trailing slash). */
export const SITE_URL = trimSlash(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
)

/** Product name shown in the UI and in metadata. */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'ECV Base'

/** True only on the production deployment (not previews, not local). */
export const IS_PRODUCTION_DEPLOYMENT =
  process.env.VERCEL_ENV === 'production' || process.env.SITE_ENV === 'production'

/** Preview deployments and local builds send `X-Robots-Tag: noindex` for the whole site. */
export const ALLOW_INDEXING = IS_PRODUCTION_DEPLOYMENT || process.env.ALLOW_INDEXING === 'true'

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ''
