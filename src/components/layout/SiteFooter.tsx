import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatDate } from '@/lib/catalog/format'
import { href } from '@/lib/urls'

import { LogoMark } from './Logo'

export async function SiteFooter({ catalog }: { catalog: Catalog }) {
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const tPages = await getTranslations('pages')
  const tSite = await getTranslations('site')
  const locale = (await getLocale()) as Locale
  const groups = catalog.groups.filter((g) => catalog.countForType(g) > 0)
  const areas = catalog.areas.filter((a) => catalog.countForJob(a) > 0)
  const updated = catalog.latestUpdate()
  const col = 'space-y-2 text-[14px] text-muted'
  const a = 'hover:text-ink hover:underline'

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="font-display text-[17px] font-bold">{tSite('name')}</span>
          </div>
          <p className="mt-3 max-w-xs text-[14px] text-muted">{catalog.data.settings.tagline || tSite('tagline')}</p>
          <p className="mt-3 max-w-xs text-[13px] text-muted">{t('independence')}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">{tNav('types')}</p>
          <ul className={col}>
            {groups.map((g) => (
              <li key={g.id}>
                <Link href={href.type(g, locale)} className={a}>
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{tNav('jobs')}</p>
          <ul className={col}>
            {areas.map((j) => (
              <li key={j.id}>
                <Link href={href.job(j)} className={a}>
                  {j.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('catalogue')}</p>
          <ul className={col}>
            <li>
              <Link href={href.vehicles()} className={a}>
                {tNav('allVehicles')}
              </Link>
            </li>
            <li>
              <Link href={href.brands()} className={a}>
                {tNav('brands')}
              </Link>
            </li>
            <li>
              <Link href={href.guides()} className={a}>
                {tNav('guides')}
              </Link>
            </li>
            <li>
              <Link href={href.compare()} className={a}>
                {tNav('compare')}
              </Link>
            </li>
            {catalog.data.settings.openDataEnabled && (
              <li>
                <Link href={href.data()} className={a}>
                  {tPages('data')}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">{t('trust')}</p>
          <ul className={col}>
            <li>
              <Link href={href.about()} className={a}>
                {tPages('about')}
              </Link>
            </li>
            <li>
              <Link href={href.methodology()} className={a}>
                {tPages('methodology')}
              </Link>
            </li>
            <li>
              <Link href={href.ranking()} className={a}>
                {tPages('ranking')}
              </Link>
            </li>
            <li>
              <Link href={href.manufacturers()} className={a}>
                {tPages('manufacturers')}
              </Link>
            </li>
            <li>
              <Link href={href.imprint()} className={a}>
                {tPages('imprint')}
              </Link>
            </li>
            <li>
              <Link href={href.privacy()} className={a}>
                {tPages('privacy')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[12.5px] text-muted md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            {catalog.data.settings.notice} {updated ? t('updated', { date: formatDate(updated, locale) }) : ''}{' '}
            {t('illustrations')}
          </p>
          <p className="shrink-0">{t('rights', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  )
}
