import 'server-only'

import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'

import type { Guide, Media, Page } from '@/payload-types'

import { DEFAULT_LOCALE, type Locale } from '../i18n/config'
import { getPayloadClient } from './catalog/load'
import type { Faq, RichTextValue } from './catalog/types'
import { CATALOG_TAG } from './constants'

export type GuideSummary = {
  id: number
  slug: string
  title: string
  excerpt: string
  publishedAt: string | null
  updatedAt: string
  image: { url: string; alt: string; width: number; height: number } | null
}

export type GuideFull = GuideSummary & {
  content: RichTextValue
  faqs: Faq[]
  author: { name: string | null; role: string | null }
  relatedTypeIds: number[]
  relatedJobIds: number[]
  relatedListingIds: number[]
}

export type PageContent = {
  key: string
  title: string
  intro: string | null
  content: RichTextValue
  faqs: Faq[]
  updatedAt: string
  seo: { title?: string | null; description?: string | null; noindex?: boolean | null }
}

const ids = (v: unknown): number[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === 'object' && x ? (x as { id: number }).id : (x as number))).filter(Boolean) : []

const faqs = (v: unknown): Faq[] =>
  Array.isArray(v) ? v.filter((f) => f?.question && f?.answer).map((f) => ({ question: f.question, answer: f.answer })) : []

async function isDraft() {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

function toSummary(g: Guide): GuideSummary {
  const img = g.heroImage && typeof g.heroImage === 'object' ? (g.heroImage as Media) : null
  const sized = img?.sizes?.large ?? img?.sizes?.card
  return {
    id: g.id,
    slug: g.slug ?? String(g.id),
    title: g.title,
    excerpt: g.excerpt,
    publishedAt: g.publishedAt ?? null,
    updatedAt: g.updatedAt,
    image: img && sized?.url ? { url: sized.url, alt: img.alt, width: sized.width ?? 0, height: sized.height ?? 0 } : null,
  }
}

async function fetchGuides(locale: Locale, drafts: boolean): Promise<GuideFull[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'guides',
    locale,
    fallbackLocale: false,
    depth: 1,
    limit: 0,
    pagination: false,
    sort: '-publishedAt',
    overrideAccess: true,
    ...(drafts ? { draft: true } : { where: { _status: { equals: 'published' } } }),
  })
  return (res.docs as Guide[])
    .filter((g) => g.title && g.slug && g.content)
    .map((g) => ({
      ...toSummary(g),
      content: (g.content as RichTextValue) ?? null,
      faqs: faqs(g.faqs),
      author: { name: g.author?.name ?? null, role: g.author?.role ?? null },
      relatedTypeIds: ids(g.relatedTypes),
      relatedJobIds: ids(g.relatedJobs),
      relatedListingIds: ids(g.relatedListings),
    }))
}

const cachedGuides = unstable_cache((locale: Locale) => fetchGuides(locale, false), ['guides', 'v1'], {
  tags: [CATALOG_TAG],
  revalidate: 3600,
})

export async function getGuidesFull(locale: Locale): Promise<GuideFull[]> {
  return (await isDraft()) ? fetchGuides(locale, true) : cachedGuides(locale)
}

export async function getGuides(locale: Locale): Promise<GuideSummary[]> {
  return (await getGuidesFull(locale)).map(({ content: _c, faqs: _f, ...rest }) => rest)
}

export async function getGuide(locale: Locale, slug: string): Promise<GuideFull | null> {
  return (await getGuidesFull(locale)).find((g) => g.slug === slug) ?? null
}

async function fetchPage(locale: Locale, key: string): Promise<PageContent | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    locale,
    fallbackLocale: locale === DEFAULT_LOCALE ? undefined : false,
    where: { key: { equals: key } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const p = res.docs[0] as Page | undefined
  if (!p?.title) return null
  return {
    key: p.key,
    title: p.title,
    intro: p.intro ?? null,
    content: (p.content as RichTextValue) ?? null,
    faqs: faqs(p.faqs),
    updatedAt: p.updatedAt,
    seo: { title: p.seo?.title, description: p.seo?.description, noindex: p.seo?.noindex },
  }
}

const cachedPage = unstable_cache(fetchPage, ['page', 'v1'], { tags: [CATALOG_TAG], revalidate: 3600 })

export async function getPage(locale: Locale, key: string): Promise<PageContent | null> {
  return (await isDraft()) ? fetchPage(locale, key) : cachedPage(locale, key)
}
