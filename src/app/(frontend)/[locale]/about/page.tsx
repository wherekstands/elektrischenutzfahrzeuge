import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { getPage } from '@/lib/content'
import { aboutPageLd, organizationLd } from '@/lib/seo/jsonld'
import { href, pathFor } from '@/lib/urls'
import { TrustPageView, trustMetadata } from '@/views/trust'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return trustMetadata(locale as Locale, 'about')
}

/** About: names the person behind the site (E-E-A-T) from Settings → "Person behind the site". */
export default async function Page({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const catalog = await getCatalog(locale)
  const page = await getPage(locale, 'about')
  const owner = catalog.data.settings.owner
  return (
    <TrustPageView
      locale={locale}
      pageKey="about"
      after={
        owner.name ? (
          <section className="mt-10 rounded-card border border-line bg-surface p-6">
            <p className="font-display text-[20px] font-bold">{owner.name}</p>
            {owner.role && <p className="text-[14px] text-muted">{owner.role}</p>}
            {owner.bio && <p className="mt-3 text-ink-2">{owner.bio}</p>}
            {owner.url && (
              <a href={owner.url} rel="me noopener" target="_blank" className="link mt-3 inline-block text-[14px]">
                {owner.url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </section>
        ) : null
      }
      jsonLd={[aboutPageLd({ name: page?.title ?? 'About', path: pathFor(locale, href.about()), locale }), organizationLd(catalog.data.settings)]}
    />
  )
}
