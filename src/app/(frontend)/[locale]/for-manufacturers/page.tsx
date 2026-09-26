import { Check, LogIn, Mail, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Faqs } from '@/components/ui/Faqs'
import { JsonLd } from '@/components/ui/JsonLd'
import { RichText } from '@/components/ui/RichText'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { formatPrice } from '@/lib/catalog/format'
import { cn } from '@/lib/cn'
import { getPage } from '@/lib/content'
import { breadcrumbLd, faqLd } from '@/lib/seo/jsonld'
import { href, pathFor } from '@/lib/urls'
import { trustMetadata } from '@/views/trust'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return trustMetadata(locale as Locale, 'for-manufacturers')
}

export default async function ForManufacturers({ params }: Props) {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const [catalog, page] = await Promise.all([getCatalog(locale), getPage(locale, 'for-manufacturers')])
  if (!page) notFound()
  const t = await getTranslations('manufacturers')
  const tNav = await getTranslations('nav')
  const tHub = await getTranslations('hub')
  const tPages = await getTranslations('pages')
  const { tiers, note } = catalog.data.pricing
  const email = catalog.data.settings.partnersEmail || catalog.data.settings.contactEmail
  const crumbs = [
    { name: tNav('home'), path: pathFor(locale, href.home()) },
    { name: page.title, path: pathFor(locale, href.manufacturers()) },
  ]

  return (
    <div className="container-page pt-6">
      <Breadcrumbs items={crumbs} />
      <section className="mt-8 max-w-3xl">
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,56px)] font-extrabold leading-[1.03]">{t('title')}</h1>
        {page.intro && <p className="mt-5 text-[18px] text-ink-2">{page.intro}</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          {email && (
            <a href={`mailto:${email}?subject=${encodeURIComponent(t('ctaSubject'))}`} className="btn btn-primary">
              <Mail size={16} aria-hidden />
              {t('cta')}
            </a>
          )}
          <a href="/admin" className="btn btn-secondary" rel="nofollow">
            <LogIn size={16} aria-hidden />
            {t('portal')}
          </a>
        </div>
      </section>

      <section aria-labelledby="tiers" className="mt-14">
        <h2 id="tiers" className="text-[26px] font-bold">
          {t('tiersTitle')}
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.tier} className={cn('flex flex-col rounded-card border bg-surface p-6', tier.highlight ? 'border-accent shadow-2 ring-1 ring-accent/30' : 'border-line')}>
              <p className="font-display text-[22px] font-bold">{tier.name}</p>
              {tier.description && <p className="text-[13.5px] text-muted">{tier.description}</p>}
              <p className="num mt-4 text-[28px]">
                {tier.pricePerModelYear ? t('from', { price: formatPrice(tier.pricePerModelYear, locale) }) : t('free')}{' '}
                {tier.pricePerModelYear ? <span className="unit text-[13px]">{t('perModel')}</span> : null}
              </p>
              <ul className="mt-5 space-y-2.5 text-[14.5px]">
                {tier.features.map((f, i) => (
                  <li key={i} className={cn('flex gap-2.5', !f.included && 'text-faint')}>
                    {f.included ? (
                      <Check size={17} className="mt-0.5 shrink-0 text-good" aria-label={t('included')} />
                    ) : (
                      <Minus size={17} className="mt-0.5 shrink-0" aria-label={t('notIncluded')} />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {note && <p className="mt-4 text-[13px] text-muted">{note}</p>}
        <p className="mt-2 text-[13px] text-muted">
          {t('rankingNote')}{' '}
          <Link href={href.ranking()} className="link">
            {tPages('ranking')}
          </Link>
        </p>
      </section>

      <div className="mt-14 max-w-3xl">
        <RichText value={page.content} locale={locale} />
        <Faqs title={tHub('faqTitle')} faqs={page.faqs} />
      </div>
      <JsonLd data={[breadcrumbLd(crumbs), faqLd(page.faqs)]} />
    </div>
  )
}
