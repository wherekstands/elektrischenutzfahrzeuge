import { getLocale, getTranslations } from 'next-intl/server'

import { HeaderCounts } from '@/components/client/HeaderCounts'
import { ThemeToggle } from '@/components/client/ThemeToggle'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { href, pathFor } from '@/lib/urls'

import { LogoMark } from './Logo'
import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
import { SearchBox } from './SearchBox'

export async function SiteHeader({ catalog }: { catalog: Catalog }) {
  const t = await getTranslations('nav')
  const tSite = await getTranslations('site')
  const locale = (await getLocale()) as Locale
  const groups = catalog.groups.filter((g) => catalog.countForType(g) > 0)
  const areas = catalog.areas.filter((a) => catalog.countForJob(a) > 0)
  const vehiclesPath = pathFor(locale, href.vehicles())

  const typesPanel = (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.id}>
            <Link href={href.type(g, locale)} className="text-[14px] font-semibold text-ink hover:text-accent">
              {g.name}
            </Link>
            <ul className="mt-1.5 space-y-1">
              {catalog
                .typesInGroup(g)
                .filter((c) => catalog.countForType(c) > 0)
                .map((c) => (
                  <li key={c.id}>
                    <Link href={href.type(c, locale)} className="text-[13.5px] text-muted hover:text-ink">
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href={href.types()} className="link mt-5 inline-block text-[14px] font-medium">
        {t('allTypes')} →
      </Link>
    </div>
  )

  const jobsPanel = (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
        {areas.map((a) => (
          <div key={a.id}>
            <Link href={href.job(a)} className="text-[14px] font-semibold text-ink hover:text-accent">
              {a.name}
            </Link>
            <ul className="mt-1.5 space-y-1">
              {catalog
                .childrenOf(a)
                .filter((j) => catalog.countForJob(j) > 0)
                .map((j) => (
                  <li key={j.id}>
                    <Link href={href.job(j)} className="text-[13.5px] text-muted hover:text-ink">
                      {j.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href={href.jobs()} className="link mt-5 inline-block text-[14px] font-medium">
        {t('allJobs')} →
      </Link>
    </div>
  )

  const navLink = 'inline-flex h-9 items-center rounded-full px-3 text-[14px] font-medium text-ink-2 transition hover:bg-surface-2'

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--glass)] backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-2">
        {tSite('skipToContent')}
      </a>
      <div className="container-page flex h-[68px] items-center gap-3 md:gap-5">
        <Link href={href.home()} className="flex items-center gap-2.5" aria-label={tSite('name')}>
          <LogoMark />
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-[18px] font-bold tracking-tight">{tSite('name')}</span>
            <span className="block text-[11.5px] text-muted">{tSite('tagline')}</span>
          </span>
        </Link>

        <SearchBox action={vehiclesPath} className="min-w-0 flex-1 md:max-w-[420px]" />

        <nav aria-label={t('main')} className="hidden items-center gap-0.5 md:flex">
          <NavDropdown label={t('types')} wide>
            {typesPanel}
          </NavDropdown>
          <NavDropdown label={t('jobs')} wide>
            {jobsPanel}
          </NavDropdown>
          <Link href={href.brands()} className={navLink}>
            {t('brands')}
          </Link>
          <Link href={href.guides()} className={`${navLink} hidden xl:inline-flex`}>
            {t('guides')}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <HeaderCounts />
          <span className="hidden sm:block">
            <ThemeToggle />
          </span>
          <MobileMenu openLabel={t('openMenu')} closeLabel={t('closeMenu')}>
            <nav aria-label={t('main')} className="flex flex-col gap-6">
              <Link href={href.vehicles()} className="font-semibold">
                {t('allVehicles')}
              </Link>
              <div>
                <p className="eyebrow mb-2">{t('types')}</p>
                <ul className="space-y-2">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <Link href={href.type(g, locale)} className="text-[15px]">
                        {g.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-2">{t('jobs')}</p>
                <ul className="space-y-2">
                  {areas.map((a) => (
                    <li key={a.id}>
                      <Link href={href.job(a)} className="text-[15px]">
                        {a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 text-[15px]">
                <Link href={href.brands()}>{t('brands')}</Link>
                <Link href={href.guides()}>{t('guides')}</Link>
                <Link href={href.manufacturers()}>{t('forManufacturers')}</Link>
              </div>
              <ThemeToggle />
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
