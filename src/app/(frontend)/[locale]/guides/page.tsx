import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { HubHeader } from '@/components/hub/HubHeader'
import { JsonLd } from '@/components/ui/JsonLd'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { formatDate } from '@/lib/catalog/format'
import { getGuides } from '@/lib/content'
import { breadcrumbLd, collectionPageLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { alternates } from '@/views/shared'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tG = await getTranslations({ locale, namespace: 'guides' })
  const guides = await getGuides(locale)
  return buildMetadata({
    locale,
    title: fitTitle(t('guidesTitle')),
    description: tG('lead'),
    path: pathFor(locale, href.guides()),
    alternates: await alternates((_c, l) => pathFor(l, href.guides())),
    noindex: guides.length === 0,
  })
}

export default async function GuidesIndex({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const t = await getTranslations('guides')
  const tNav = await getTranslations('nav')
  const guides = await getGuides(locale)
  const path = pathFor(locale, href.guides())
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('guides'), path },
  ]
  return (
    <div className="container-page">
      <HubHeader crumbs={crumbs} title={t('title')} lead={t('lead')} />
      {guides.length ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <li key={g.id}>
              <Link href={href.guide(g.slug)} className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 transition hover:shadow-2">
                <p className="text-[12.5px] text-muted">{formatDate(g.publishedAt ?? g.updatedAt, locale)}</p>
                <h2 className="mt-2 text-[20px] font-bold leading-snug group-hover:text-accent">{g.title}</h2>
                <p className="mt-2 flex-1 text-[14.5px] text-muted">{g.excerpt}</p>
                <span className="link mt-4 text-[14px] font-medium">{t('readMore')} →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t('empty')}</p>
      )}
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({ name: t('title'), description: t('lead'), path, locale, items: guides.map((g) => ({ url: pathFor(locale, href.guide(g.slug)), name: g.title })) }),
        ]}
      />
    </div>
  )
}
