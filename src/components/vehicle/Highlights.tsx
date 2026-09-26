import { Check, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { DemoBadge } from '@/components/ui/Badges'
import { Link } from '@/i18n/navigation'
import type { Catalog } from '@/lib/catalog/catalog'
import type { Listing } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

/**
 * "At a glance": three key facts (checked by us, every listing) next to three key benefits
 * (the manufacturer's words, Pro partners only). Both columns always render so every listing has the
 * same structure; without a Pro partnership the benefits column shows a neutral placeholder.
 */
export async function Highlights({ listing, catalog }: { listing: Listing; catalog: Catalog }) {
  const t = await getTranslations('vehicle')
  const brand = catalog.brandOf(listing)
  const showBenefits = catalog.showBenefits(listing)
  const facts = listing.keyFacts.slice(0, 3)

  return (
    <section aria-labelledby="highlights" className="grid gap-4 md:grid-cols-2">
      <h2 id="highlights" className="sr-only">
        {t('highlights')}
      </h2>
      <div className="rounded-card border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="eyebrow">{t('keyFacts')}</h3>
          <span className="text-[11.5px] text-faint">{t('keyFactsHint')}</span>
        </div>
        <ul className="mt-3 min-h-[96px] space-y-2.5">
          {facts.length ? (
            facts.map((f, i) => (
              <li key={i} className="flex gap-2.5 text-[14.5px] text-ink-2">
                <Check size={17} className="mt-0.5 shrink-0 text-good" aria-hidden />
                {f}
              </li>
            ))
          ) : (
            <li className="text-[14px] text-faint">—</li>
          )}
        </ul>
      </div>
      <div className={showBenefits ? 'rounded-card border border-amber/40 bg-amber-soft/60 p-5' : 'rounded-card border border-dashed border-line-strong p-5'}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="eyebrow">{t('benefits')}</h3>
          <span className="flex items-center gap-2 text-[11.5px] text-muted">
            {showBenefits && t('benefitsBy', { brand: brand.name })}
            {showBenefits && listing.demo && <DemoBadge />}
          </span>
        </div>
        {showBenefits ? (
          <ul className="mt-3 min-h-[96px] space-y-2.5">
            {listing.keyBenefits.slice(0, 3).map((b, i) => (
              <li key={i} className="flex gap-2.5 text-[14.5px] text-ink-2">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-amber" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 flex min-h-[96px] flex-col justify-center gap-2">
            <p className="text-[14px] text-muted">{t('benefitsEmpty', { brand: brand.name })}</p>
            <Link href={href.manufacturers()} className="link text-[13.5px]">
              {t('benefitsCta', { brand: brand.name })}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
