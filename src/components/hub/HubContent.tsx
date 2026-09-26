import { getTranslations } from 'next-intl/server'

import { Faqs } from '@/components/ui/Faqs'
import { RichText } from '@/components/ui/RichText'
import type { Locale } from '@/i18n/config'
import type { Faq, RichTextValue } from '@/lib/catalog/types'
import type { Href } from '@/lib/urls'
import { Link } from '@/i18n/navigation'

/** Editorial part of a hub: intro, FAQs and related hubs. */
export async function HubContent({
  locale,
  aboutTitle,
  intro,
  faqs,
  related,
}: {
  locale: Locale
  aboutTitle: string
  intro: RichTextValue
  faqs: Faq[]
  related: { title: string; items: { key: string | number; name: string; href: Href }[] }[]
}) {
  const t = await getTranslations('hub')
  const hasRelated = related.some((r) => r.items.length)
  if (!intro && !faqs.length && !hasRelated) return null
  return (
    <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {intro ? (
          <section aria-labelledby="hub-about">
            <h2 id="hub-about" className="text-[22px] font-bold">
              {aboutTitle}
            </h2>
            <RichText value={intro} locale={locale} className="mt-3 max-w-3xl" />
          </section>
        ) : null}
        <Faqs title={t('faqTitle')} faqs={faqs} />
      </div>
      {hasRelated && (
        <aside className="space-y-8">
          {related
            .filter((r) => r.items.length)
            .map((r) => (
              <nav key={r.title} aria-label={r.title}>
                <p className="eyebrow mb-3">{r.title}</p>
                <ul className="space-y-2 text-[14.5px]">
                  {r.items.map((i) => (
                    <li key={i.key}>
                      <Link href={i.href} className="link">
                        {i.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
        </aside>
      )}
    </div>
  )
}
