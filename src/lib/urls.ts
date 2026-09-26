/**
 * Every internal link is built here, so localized path segments (next-intl `pathnames`) and localized
 * taxonomy slugs are applied consistently. Use `href.*` with next-intl's <Link>, `pathFor` for strings.
 */
import { getPathname } from '../i18n/navigation'
import { COMBO_SEGMENT, type Locale } from '../i18n/config'
import type { JobNode, TypeNode } from './catalog/types'
import { SITE_URL } from './env'

type Query = Record<string, string>

export const href = {
  home: () => ({ pathname: '/' as const }),
  vehicles: (query?: Query) => ({ pathname: '/vehicles' as const, ...(query ? { query } : {}) }),
  vehicle: (slug: string) => ({ pathname: '/vehicles/[slug]' as const, params: { slug } }),
  correction: (slug: string) => ({ pathname: '/vehicles/[slug]/suggest-correction' as const, params: { slug } }),
  types: () => ({ pathname: '/types' as const }),
  type: (node: TypeNode, locale: Locale, job?: JobNode | null) => ({
    pathname: '/types/[...slug]' as const,
    params: { slug: [...node.path, ...(job ? [COMBO_SEGMENT[locale], job.slug] : [])] },
  }),
  jobs: () => ({ pathname: '/jobs' as const }),
  job: (node: JobNode) => ({ pathname: '/jobs/[...slug]' as const, params: { slug: node.path } }),
  brands: () => ({ pathname: '/brands' as const }),
  brand: (slug: string) => ({ pathname: '/brands/[slug]' as const, params: { slug } }),
  compare: (slugs?: string[]) => ({
    pathname: '/compare' as const,
    ...(slugs?.length ? { query: { ids: slugs.join(',') } } : {}),
  }),
  saved: (slugs?: string[]) => ({
    pathname: '/saved' as const,
    ...(slugs?.length ? { query: { ids: slugs.join(',') } } : {}),
  }),
  guides: () => ({ pathname: '/guides' as const }),
  guide: (slug: string) => ({ pathname: '/guides/[slug]' as const, params: { slug } }),
  about: () => ({ pathname: '/about' as const }),
  methodology: () => ({ pathname: '/methodology' as const }),
  ranking: () => ({ pathname: '/how-ranking-works' as const }),
  manufacturers: () => ({ pathname: '/for-manufacturers' as const }),
  imprint: () => ({ pathname: '/legal/imprint' as const }),
  privacy: () => ({ pathname: '/legal/privacy' as const }),
  data: () => ({ pathname: '/data' as const }),
}

export type Href = Parameters<typeof getPathname>[0]['href']

/** Locale-prefixed path, e.g. /en/types/vans/small-vans */
export const pathFor = (locale: Locale, h: Href) => getPathname({ locale, href: h })

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

export const absoluteFor = (locale: Locale, h: Href) => absolute(pathFor(locale, h))

/** Append a query string to a locale-prefixed path. */
export const withQuery = (path: string, query: string | URLSearchParams) => {
  const q = typeof query === 'string' ? query.replace(/^\?/, '') : query.toString()
  return q ? `${path}?${q}` : path
}

/**
 * Rewrite links in CMS rich text that point at English paths (e.g. "/en/how-ranking-works")
 * to the current locale, so editors can write links once.
 */
export function localizeInternalHref(url: string, locale: Locale): string {
  if (!url.startsWith('/en/') || locale === 'en') return url
  const rest = url.slice(3)
  const staticMap: Record<string, Href> = {
    '/vehicles': href.vehicles(),
    '/types': href.types(),
    '/jobs': href.jobs(),
    '/brands': href.brands(),
    '/compare': href.compare(),
    '/guides': href.guides(),
    '/about': href.about(),
    '/methodology': href.methodology(),
    '/how-ranking-works': href.ranking(),
    '/for-manufacturers': href.manufacturers(),
    '/legal/imprint': href.imprint(),
    '/legal/privacy': href.privacy(),
    '/data': href.data(),
  }
  const target = staticMap[rest]
  return target ? pathFor(locale, target) : url
}
