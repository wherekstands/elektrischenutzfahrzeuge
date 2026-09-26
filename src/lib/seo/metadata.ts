/**
 * Metadata for every page (docs/03 §3): title ≤ 60 characters, description ≤ 155, canonical,
 * hreflang for each published locale plus x-default, Open Graph/Twitter, robots.
 */
import type { Metadata } from 'next'

import { DEFAULT_LOCALE, OG_LOCALE, type Locale } from '../../i18n/config'
import { SITE_NAME } from '../env'
import { absolute } from '../urls'

export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 155

const SUFFIX = ` | ${SITE_NAME}`

/** Add the site suffix when it fits; otherwise shorten at a word boundary. */
export function fitTitle(title: string, max = TITLE_MAX): string {
  const clean = title.replace(/\s+/g, ' ').trim()
  if (clean.length + SUFFIX.length <= max) return clean + SUFFIX
  if (clean.length <= max) return clean
  return truncate(clean, max)
}

/** Pick the longest candidate that fits with the suffix, e.g. dropping title parts that don't fit. */
export function fitTitleCandidates(candidates: string[], max = TITLE_MAX): string {
  for (const c of candidates) if (c.length + SUFFIX.length <= max) return c + SUFFIX
  for (const c of candidates) if (c.length <= max) return c
  return truncate(candidates[candidates.length - 1] ?? SITE_NAME, max)
}

export function truncate(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, '')}…`
}

export type PageMeta = {
  locale: Locale
  /** Full title incl. suffix (use fitTitle / fitTitleCandidates). */
  title: string
  description: string
  /** Locale-prefixed path of this page (canonical). */
  path: string
  /** Paths of the same page in every published locale (hreflang). Defaults to this locale only. */
  alternates?: Partial<Record<Locale, string>>
  noindex?: boolean
  /** Canonical points elsewhere (faceted URLs → hub). */
  canonicalPath?: string
  ogType?: 'website' | 'article'
  /** Markdown twin, linked with <link rel="alternate" type="text/markdown">. */
  markdownPath?: string
  images?: { url: string; width?: number; height?: number; alt?: string }[]
  publishedTime?: string
  modifiedTime?: string
}

export function buildMetadata(m: PageMeta): Metadata {
  const canonical = absolute(m.canonicalPath ?? m.path)
  const alternates = m.alternates ?? { [m.locale]: m.path }
  const languages: Record<string, string> = {}
  for (const [loc, p] of Object.entries(alternates)) if (p) languages[loc] = absolute(p)
  const xDefault = alternates[DEFAULT_LOCALE] ?? Object.values(alternates)[0]
  if (xDefault && !m.noindex) languages['x-default'] = absolute(xDefault)
  const description = truncate(m.description, DESCRIPTION_MAX)
  // Default share image; vehicle and brand pages override it with their own opengraph-image files.
  const images = m.images ?? [{ url: absolute(`/og/${m.locale}/default`), width: 1200, height: 630, alt: SITE_NAME }]

  return {
    title: { absolute: m.title },
    description,
    alternates: {
      canonical,
      ...(m.noindex ? {} : { languages }),
      ...(m.markdownPath ? { types: { 'text/markdown': absolute(m.markdownPath) } } : {}),
    },
    robots: m.noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: m.title,
      description,
      url: absolute(m.path),
      siteName: SITE_NAME,
      type: m.ogType ?? 'website',
      locale: OG_LOCALE[m.locale],
      alternateLocale: Object.keys(alternates)
        .filter((l) => l !== m.locale)
        .map((l) => OG_LOCALE[l as Locale]),
      images,
      ...(m.publishedTime ? { publishedTime: m.publishedTime } : {}),
      ...(m.modifiedTime ? { modifiedTime: m.modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: m.title, description, images: images.map((i) => i.url) },
  }
}
