import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { HubHeader } from '@/components/hub/HubHeader'
import { JsonLd } from '@/components/ui/JsonLd'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { breadcrumbLd, collectionPageLd } from '@/lib/seo/jsonld'
import { buildMetadata, fitTitle } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { alternates } from '@/views/shared'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const catalog = await getCatalog(locale)
  const t = await getTranslations({ locale, namespace: 'meta' })
  const tHub = await getTranslations({ locale, namespace: 'hub' })
  const leaf = catalog.jobs.filter((x) => x.parentId && catalog.countForJob(x) > 0)
  return buildMetadata({
    locale,
    title: fitTitle(t('jobsTitle')),
    description: tHub('jobsIndexLead', { count: leaf.length, areas: catalog.areas.filter((a) => catalog.countForJob(a) > 0).length }),
    path: pathFor(locale, href.jobs()),
    alternates: await alternates((_c, l) => pathFor(l, href.jobs())),
  })
}

export default async function JobsIndex({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const t = await getTranslations('hub')
  const tNav = await getTranslations('nav')
  const areas = catalog.areas.filter((a) => catalog.countForJob(a) > 0)
  const leaf = catalog.jobs.filter((x) => x.parentId && catalog.countForJob(x) > 0)
  const path = pathFor(locale, href.jobs())
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('jobs'), path },
  ]
  return (
    <div className="container-page">
      <HubHeader crumbs={crumbs} title={t('jobsIndexTitle')} lead={t('jobsIndexLead', { count: leaf.length, areas: areas.length })} />
      <div className="grid gap-5 md:grid-cols-2">
        {areas.map((a) => (
          <section key={a.id} aria-labelledby={`a-${a.id}`} className="rounded-card border border-line bg-surface p-6">
            <h2 id={`a-${a.id}`} className="text-[20px] font-bold">
              <Link href={href.job(a)} className="hover:text-accent">
                {a.name}
              </Link>{' '}
              <span className="num text-[14px] font-normal text-muted">{catalog.countForJob(a)}</span>
            </h2>
            {a.shortDescription && <p className="mt-1 text-[14.5px] text-muted">{a.shortDescription}</p>}
            <ul className="mt-4 space-y-1.5">
              {catalog
                .childrenOf(a)
                .filter((j) => catalog.countForJob(j) > 0)
                .map((j) => (
                  <li key={j.id}>
                    <Link href={href.job(j)} className="group flex items-baseline justify-between gap-2 border-b border-line py-1.5">
                      <span className="text-[14.5px] group-hover:text-accent">{j.name}</span>
                      <span className="num text-[12.5px] text-muted">{catalog.countForJob(j)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: t('jobsIndexTitle'),
            description: t('jobsIndexLead', { count: leaf.length, areas: areas.length }),
            path,
            locale,
            items: leaf.map((x) => ({ url: pathFor(locale, href.job(x)), name: x.name })),
          }),
        ]}
      />
    </div>
  )
}
