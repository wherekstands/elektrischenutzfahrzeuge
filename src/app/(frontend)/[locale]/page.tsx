import { ArrowRight, BadgeCheck, Mail, Scale } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { SearchBox } from '@/components/layout/SearchBox'
import { Illustration } from '@/components/ui/Illustration'
import { JsonLd } from '@/components/ui/JsonLd'
import { VehicleCard } from '@/components/vehicle/VehicleCard'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { getGuides } from '@/lib/content'
import { organizationLd, websiteLd } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { href, pathFor } from '@/lib/urls'
import { alternates } from '@/views/shared'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: 'meta' })
  return buildMetadata({
    locale,
    title: t('homeTitle'),
    description: t('homeDescription'),
    path: pathFor(locale, href.home()),
    alternates: await alternates((_c, l) => pathFor(l, href.home())),
  })
}

export default async function Home({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')
  const guides = (await getGuides(locale)).slice(0, 3)

  const groups = catalog.groups.filter((g) => catalog.countForType(g) > 0)
  const areas = catalog.areas.filter((a) => catalog.countForJob(a) > 0)
  const featured = catalog.featuredListings({ home: true })
  const recent = [...catalog.listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6)
  const vehiclesPath = pathFor(locale, href.vehicles())

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(closest-side, var(--accent-soft), transparent)' }}
        />
        <div className="container-page relative grid gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">{t('eyebrow', { count: catalog.listings.length })}</p>
            <h1 className="mt-3 text-[clamp(34px,5.2vw,60px)] font-extrabold leading-[1.02]">{t('title')}</h1>
            <p className="mt-5 max-w-xl text-[17px] text-ink-2">{t('lead')}</p>
            <SearchBox action={vehiclesPath} className="mt-7 max-w-xl" />
            <p className="mt-2.5 text-[13px] text-muted">{t('searchHint')}</p>
            <p className="mt-6 text-[13.5px] text-muted">
              {t('stats', {
                listings: catalog.listings.length,
                brands: catalog.activeBrands.length,
                types: catalog.types.filter((x) => x.parentId && catalog.countForType(x) > 0).length,
                jobs: catalog.jobs.filter((x) => x.parentId && catalog.countForJob(x) > 0).length,
              })}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3" aria-hidden>
            {groups.slice(0, 6).map((g, i) => (
              <div key={g.id} className={`overflow-hidden rounded-card border border-line bg-bg ${i % 2 ? 'translate-y-6' : ''}`}>
                <Illustration type={g.illustration} seed={g.slug} className="block aspect-[4/3] [&>svg]:size-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page">
        <section aria-labelledby="by-type" className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="by-type" className="text-[26px] font-bold">
                {t('byType')}
              </h2>
              <p className="mt-1 text-muted">{t('byTypeLead')}</p>
            </div>
            <Link href={href.types()} className="link hidden shrink-0 text-[14px] sm:inline">
              {tNav('allTypes')} →
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <li key={g.id}>
                <Link href={href.type(g, locale)} className="group flex h-full items-center gap-4 rounded-card border border-line bg-surface p-3 pr-5 transition hover:-translate-y-0.5 hover:shadow-2">
                  <Illustration type={g.illustration} seed={g.slug} className="block w-28 shrink-0 overflow-hidden rounded-box [&>svg]:aspect-[4/3] [&>svg]:w-full" />
                  <span className="min-w-0">
                    <span className="block font-display text-[17px] font-bold group-hover:text-accent">{g.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted">{g.shortDescription}</span>
                    <span className="mt-1 block text-[12.5px] font-medium text-ink-2">{t('models', { count: catalog.countForType(g) })}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="by-job" className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="by-job" className="text-[26px] font-bold">
                {t('byJob')}
              </h2>
              <p className="mt-1 text-muted">{t('byJobLead')}</p>
            </div>
            <Link href={href.jobs()} className="link hidden shrink-0 text-[14px] sm:inline">
              {tNav('allJobs')} →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {areas.map((a) => (
              <div key={a.id} className="rounded-card border border-line bg-surface p-5">
                <Link href={href.job(a)} className="font-display text-[16.5px] font-bold hover:text-accent">
                  {a.name}
                </Link>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {catalog
                    .childrenOf(a)
                    .filter((j) => catalog.countForJob(j) > 0)
                    .map((j) => (
                      <li key={j.id}>
                        <Link href={href.job(j)} className="chip h-7 text-[12.5px]">
                          {j.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section aria-labelledby="featured" className="mt-16">
            <h2 id="featured" className="text-[26px] font-bold">
              {t('featured')}
            </h2>
            <div className="results-grid mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((l) => (
                <VehicleCard key={l.id} listing={l} catalog={catalog} featured />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="recent" className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="recent" className="text-[26px] font-bold">
                {t('recent')}
              </h2>
              <p className="mt-1 text-muted">{t('recentLead')}</p>
            </div>
            <Link href={href.vehicles({ sort: 'updated' })} className="link hidden shrink-0 text-[14px] sm:inline">
              {t('viewAll')} →
            </Link>
          </div>
          <div className="results-grid mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (
              <VehicleCard key={l.id} listing={l} catalog={catalog} />
            ))}
          </div>
        </section>

        <section aria-labelledby="trust" className="mt-20 grid gap-4 md:grid-cols-3">
          <h2 id="trust" className="sr-only">
            {t('trustTitle')}
          </h2>
          {[
            { icon: Scale, title: t('trust1Title'), text: t('trust1'), link: href.methodology() },
            { icon: BadgeCheck, title: t('trust2Title'), text: t('trust2'), link: href.ranking() },
            { icon: Mail, title: t('trust3Title'), text: t('trust3'), link: href.about() },
          ].map(({ icon: Icon, title, text, link }) => (
            <Link key={title} href={link} className="rounded-card border border-line bg-surface p-6 transition hover:shadow-2">
              <Icon size={22} className="text-accent" aria-hidden />
              <p className="mt-3 font-display text-[18px] font-bold">{title}</p>
              <p className="mt-1 text-[14.5px] text-muted">{text}</p>
            </Link>
          ))}
        </section>

        {guides.length > 0 && (
          <section aria-labelledby="guides" className="mt-16">
            <h2 id="guides" className="text-[26px] font-bold">
              {t('guides')}
            </h2>
            <p className="mt-1 text-muted">{t('guidesLead')}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {guides.map((g) => (
                <li key={g.id}>
                  <Link href={href.guide(g.slug)} className="block h-full rounded-card border border-line bg-surface p-6 transition hover:shadow-2">
                    <p className="font-display text-[18px] font-bold leading-snug">{g.title}</p>
                    <p className="mt-2 text-[14px] text-muted">{g.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 flex flex-col items-start gap-5 rounded-card bg-ink p-8 text-bg md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-[24px] font-bold">{t('manufacturersTitle')}</h2>
            <p className="mt-1 text-[15px] opacity-75">{t('manufacturersLead')}</p>
          </div>
          <Link href={href.manufacturers()} className="btn shrink-0 bg-volt text-volt-ink hover:opacity-90">
            {t('manufacturersCta')}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      </div>
      <JsonLd data={[websiteLd(locale, vehiclesPath), organizationLd(catalog.data.settings)]} />
    </>
  )
}
