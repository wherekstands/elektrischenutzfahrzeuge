import { getLocale, getTranslations } from 'next-intl/server'

import { SearchBox } from '@/components/layout/SearchBox'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { href, pathFor } from '@/lib/urls'

/** Real 404 (status 404, noindex) with search and the main hubs: no soft 404s (docs/03 §10). */
export default async function NotFound() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('notFound')
  const catalog = await getCatalog(locale)
  const groups = catalog.groups.filter((g) => catalog.countForType(g) > 0)
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="num text-[15px] text-muted">404</p>
        <h1 className="mt-2 text-[clamp(30px,4.5vw,46px)] font-extrabold">{t('title')}</h1>
        <p className="mt-3 text-ink-2">{t('lead')}</p>
        <SearchBox action={pathFor(locale, href.vehicles())} className="mx-auto mt-7 max-w-lg text-left" />
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link href={href.type(g, locale)} className="chip">
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={href.home()} className="btn btn-secondary mt-8">
          {t('home')}
        </Link>
      </div>
    </div>
  )
}
