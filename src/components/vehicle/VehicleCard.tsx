import { useLocale, useTranslations } from 'next-intl'

import { CompareToggle } from '@/components/client/CompareToggle'
import { SaveButton } from '@/components/client/SaveButton'
import { DemoBadge, FeaturedLabel, SponsoredLabel, StatusPill, VerifiedBadge } from '@/components/ui/Badges'
import { VehicleImage } from '@/components/ui/VehicleImage'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatPrice, specParts, type ValueLabels } from '@/lib/catalog/format'
import type { Listing } from '@/lib/catalog/types'
import { cn } from '@/lib/cn'
import { CARD_FIGURE_COUNT } from '@/lib/constants'
import { href } from '@/lib/urls'

export function useValueLabels(): ValueLabels {
  const t = useTranslations('specs')
  return { yes: t('yes'), no: t('no'), std: t('std'), opt: t('opt'), notAvailable: t('notAvailable') }
}

/**
 * Result card. Fixed structure: 4:3 image, type path, title, brand, three key figures, jobs, price and
 * compare. Paid positions carry a visible label ("Sponsored" / "Featured partner").
 */
export function VehicleCard({
  listing,
  catalog,
  sponsored = false,
  featured = false,
  priority = false,
  headingLevel = 3,
}: {
  listing: Listing
  catalog: Catalog
  sponsored?: boolean
  featured?: boolean
  priority?: boolean
  headingLevel?: 2 | 3
}) {
  const t = useTranslations('card')
  const tSpecs = useTranslations('specs')
  const locale = useLocale() as Locale
  const labels = useValueLabels()
  const brand = catalog.brandOf(listing)
  const type = catalog.typeOf(listing)
  const group = catalog.groupOf(type)
  const figures = catalog.keyFigureSpecs(listing).slice(0, CARD_FIGURE_COUNT)
  const jobs = catalog.jobsOf(listing)
  const verified = catalog.isVerified(listing)
  const price = listing.specs.price_eur
  const highlight = (sponsored || featured) && brand.highlight
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <article
      className={cn(
        'vehicle-card group relative flex flex-col overflow-hidden rounded-card border bg-surface shadow-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-2',
        highlight ? 'border-sponsored/40 ring-1 ring-sponsored/20' : 'border-line',
      )}
    >
      <div className="vehicle-card__media relative">
        <VehicleImage
          image={listing.images[0]}
          illustration={type.illustration}
          seed={listing.slug}
          alt={listing.title}
          priority={priority}
          illustrationLabel={listing.images.length ? undefined : t('illustration')}
        />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <StatusPill status={listing.availability} className="bg-surface/90 backdrop-blur" />
        </div>
        <div className="absolute right-3 top-3 z-10">
          <SaveButton slug={listing.slug} title={listing.title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {(sponsored || featured) && (
          <div className="relative z-10 mb-2">{featured ? <FeaturedLabel /> : <SponsoredLabel />}</div>
        )}
        <p className="truncate text-[12.5px] text-muted">
          {group.id !== type.id ? `${group.name} › ${type.name}` : type.name}
        </p>
        <Heading className="mt-0.5 text-[17px] font-bold leading-snug">
          <Link
            href={href.vehicle(listing.slug)}
            className="after:absolute after:inset-0 after:z-0 after:content-[''] hover:underline focus-visible:outline-none"
          >
            {listing.model}
          </Link>
        </Heading>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          <span>{brand.name}</span>
          {verified && <VerifiedBadge brand={brand.name} compact />}
          {listing.demo && <DemoBadge />}
        </div>

        <dl className="mt-3 grid grid-cols-3 divide-x divide-line border-y border-line py-2.5">
          {figures.map((spec) => {
            const p = specParts(spec, listing.specs[spec.key], locale, labels)
            return (
              <div key={spec.key} className="min-w-0 px-2 first:pl-0 last:pr-0">
                <dd className={cn('num truncate text-[15px]', !p && 'text-[13px] text-faint')}>
                  {p ? (
                    <>
                      {p.value}
                      {p.unit && <span className="unit">{p.unit}</span>}
                    </>
                  ) : (
                    '—'
                  )}
                </dd>
                <dt className="truncate text-[12px] text-muted" title={p ? undefined : tSpecs('notPublished')}>
                  {spec.shortLabel}
                </dt>
              </div>
            )
          })}
        </dl>

        {jobs.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5 text-[12.5px]">
            <li className="rounded-full border border-line px-2.5 py-0.5 text-ink-2">{jobs[0].name}</li>
            {jobs.length > 1 && (
              <li className="rounded-full border border-line px-2 py-0.5 text-muted" title={jobs.slice(1).map((j) => j.name).join(', ')}>
                {t('moreJobs', { count: jobs.length - 1 })}
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={cn('text-[13px]', typeof price === 'number' ? 'font-semibold text-ink' : 'text-muted')}>
            {typeof price === 'number' ? t('priceFrom', { price: formatPrice(price, locale) }) : t('priceOnRequest')}
          </span>
          <div className="relative z-10">
            <CompareToggle slug={listing.slug} title={listing.title} />
          </div>
        </div>
      </div>
    </article>
  )
}
