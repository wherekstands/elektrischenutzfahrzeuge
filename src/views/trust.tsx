import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Faqs } from '@/components/ui/Faqs'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/catalog/format'
import { getPage } from '@/lib/content'
import { breadcrumbLd, faqLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, type Href, pathFor } from '@/lib/urls'

import { alternates } from './shared'

export type TrustKey = 'about' | 'methodology' | 'how-ranking-works' | 'for-manufacturers' | 'imprint' | 'privacy' | 'data' | 'partner-terms'

export const TRUST_HREF: Record<Exclude<TrustKey, 'partner-terms'>, Href> = {
  about: href.about(),
  methodology: href.methodology(),
  'how-ranking-works': href.ranking(),
  'for-manufacturers': href.manufacturers(),
  imprint: href.imprint(),
  privacy: href.privacy(),
  data: href.data(),
}

export async function trustMetadata(locale: Locale, key: Exclude<TrustKey, 'partner-terms'>, noindex = false): Promise<Metadata> {
  const page = await getPage(locale, key)
  if (!page) return {}
  return buildMetadata({
    locale,
    title: fitTitle(page.seo.title || page.title),
    description: page.seo.description || page.intro || page.title,
    path: pathFor(locale, TRUST_HREF[key]),
    alternates: await alternates((_c, l) => pathFor(l, TRUST_HREF[key])),
    noindex: noindex || Boolean(page.seo.noindex),
  })
}

/** Layout for about, methodology, ranking, imprint, privacy and data pages: content from the CMS. */
export async function TrustPageView({
  locale,
  pageKey,
  before,
  after,
  jsonLd = [],
}: {
  locale: Locale
  pageKey: Exclude<TrustKey, 'partner-terms'>
  before?: ReactNode
  after?: ReactNode
  jsonLd?: unknown[]
}) {
  const page = await getPage(locale, pageKey)
  if (!page) notFound()
  const tNav = await getTranslations('nav')
  const tPages = await getTranslations('pages')
  const tHub = await getTranslations('hub')
  const path = pathFor(locale, TRUST_HREF[pageKey])
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: page.title, path },
  ]
  return (
    <div className="container-page pt-6">
      <Breadcrumbs items={crumbs} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-[clamp(30px,4.2vw,44px)] font-extrabold">{page.title}</h1>
        {page.intro && <p className="mt-4 text-[18px] leading-relaxed text-ink-2">{page.intro}</p>}
        <p className="mt-3 text-[13px] text-muted">{tPages('lastUpdated', { date: formatDate(page.updatedAt, locale) })}</p>
        {before}
        <RichText value={page.content} locale={locale} className="mt-8" />
        {after}
        <Faqs title={tHub('faqTitle')} faqs={page.faqs} />
      </article>
      <JsonLd data={[breadcrumbLd(crumbs), faqLd(page.faqs), ...jsonLd]} />
    </div>
  )
}
