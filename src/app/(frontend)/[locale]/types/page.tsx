import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { HubHeader } from '@/components/hub/HubHeader'
import { Illustration } from '@/components/ui/Illustration'
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
  const leaf = catalog.types.filter((x) => x.parentId && catalog.countForType(x) > 0)
  return buildMetadata({
    locale,
    title: fitTitle(t('typesTitle')),
    description: tHub('typesIndexLead', { count: leaf.length, groups: catalog.groups.filter((g) => catalog.countForType(g) > 0).length }),
    path: pathFor(locale, href.types()),
    alternates: await alternates((_c, l) => pathFor(l, href.types())),
  })
}

export default async function TypesIndex({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const t = await getTranslations('hub')
  const tNav = await getTranslations('nav')
  const tHome = await getTranslations('home')
  const groups = catalog.groups.filter((g) => catalog.countForType(g) > 0)
  const leaf = catalog.types.filter((x) => x.parentId && catalog.countForType(x) > 0)
  const path = pathFor(locale, href.types())
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: tNav('types'), path },
  ]
  return (
    <div className="container-page">
      <HubHeader crumbs={crumbs} title={t('typesIndexTitle')} lead={t('typesIndexLead', { count: leaf.length, groups: groups.length })} />
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`g-${g.id}`} className="grid gap-5 rounded-card border border-line bg-surface p-5 md:grid-cols-[220px_minmax(0,1fr)]">
            <Link href={href.type(g, locale)} className="group block">
              <Illustration type={g.illustration} seed={g.slug} className="block overflow-hidden rounded-box [&>svg]:aspect-[4/3] [&>svg]:w-full" />
            </Link>
            <div>
              <h2 id={`g-${g.id}`} className="text-[22px] font-bold">
                <Link href={href.type(g, locale)} className="hover:text-accent">
                  {g.name}
                </Link>{' '}
                <span className="num text-[14px] font-normal text-muted">{catalog.countForType(g)}</span>
              </h2>
              {g.shortDescription && <p className="mt-1 text-muted">{g.shortDescription}</p>}
              <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {catalog
                  .typesInGroup(g)
                  .filter((c) => catalog.countForType(c) > 0)
                  .map((c) => (
                    <li key={c.id}>
                      <Link href={href.type(c, locale)} className="group flex items-baseline justify-between gap-2 border-b border-line py-1.5">
                        <span className="text-[14.5px] group-hover:text-accent">{c.name}</span>
                        <span className="num text-[12.5px] text-muted">{tHome('models', { count: catalog.countForType(c) })}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <JsonLd
        data={[
          breadcrumbLd(crumbs),
          collectionPageLd({
            name: t('typesIndexTitle'),
            description: t('typesIndexLead', { count: leaf.length, groups: groups.length }),
            path,
            locale,
            items: leaf.map((x) => ({ url: pathFor(locale, href.type(x, locale)), name: x.name })),
          }),
        ]}
      />
    </div>
  )
}
