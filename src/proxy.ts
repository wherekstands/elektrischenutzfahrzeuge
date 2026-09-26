import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

const LOCALES = routing.locales.join('|')

/** Hubs that accept filter/sort parameters (English and localized first segments). */
const HUB_PATH = new RegExp(`^/(${LOCALES})/(vehicles|fahrzeuge|types|typen|jobs|einsatz)(/.*)?$`)
/** Markdown twin of a vehicle page: /en/vehicles/<slug>.md */
const MD_PATH = new RegExp(`^/(${LOCALES})/(?:vehicles|fahrzeuge)/([a-z0-9-]+)\\.md$`)
const INTERNAL_PATH = new RegExp(`^/(${LOCALES})/filtered(/|$)`)

/** Tracking parameters never make a page dynamic. */
const IGNORED_PARAMS = /^(utm_\w+|gclid|fbclid|msclkid|mc_cid|mc_eid|ref)$/

const hasFacetParams = (params: URLSearchParams) => [...params.keys()].some((k) => !IGNORED_PARAMS.test(k))

/**
 * Request pipeline:
 *  1. `/en/vehicles/<slug>.md` → Markdown twin route handler.
 *  2. next-intl: locale prefix, localized pathnames (no Accept-Language redirects).
 *  3. Hub URLs *with* filter parameters are rewritten to `/[locale]/filtered/…`, which renders dynamically.
 *     The same URL without parameters is served from the static, on-demand revalidated page. This keeps
 *     landing pages fast while faceted URLs stay server-rendered and crawlable (noindex, follow).
 */
export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  const md = MD_PATH.exec(pathname)
  if (md) return NextResponse.rewrite(new URL(`/md/${md[1]}/vehicles/${md[2]}`, request.url))

  if (INTERNAL_PATH.test(pathname)) return new NextResponse('Not found', { status: 404 })

  const response = intl(request)
  if (response.headers.has('location')) return response

  if (HUB_PATH.test(pathname) && hasFacetParams(searchParams)) {
    const target = new URL(response.headers.get('x-middleware-rewrite') ?? request.url)
    target.pathname = target.pathname.replace(new RegExp(`^/(${LOCALES})/`), '/$1/filtered/')
    target.search = request.nextUrl.search
    const locale = pathname.split('/')[1]
    const headers = new Headers(request.headers)
    headers.set('X-NEXT-INTL-LOCALE', locale)
    return NextResponse.rewrite(target, { request: { headers } })
  }
  return response
}

export const config = {
  matcher: [
    // Everything except API, admin, Next internals, preview/markdown internals and static files.
    // `.md` is deliberately not excluded (Markdown twins).
    '/((?!api|admin|_next|_vercel|next/|md/|og/|.*\\.(?:xml|txt|json|ico|png|jpe?g|svg|webp|avif|gif|woff2?|ttf|css|js|map|webmanifest|csv|pdf)$).*)',
  ],
}
