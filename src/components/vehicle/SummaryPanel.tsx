import { BadgeCheck, Search } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { CompareToggle } from '@/components/client/CompareToggle'
import { SaveButton } from '@/components/client/SaveButton'
import { DemoBadge, StatusPill } from '@/components/ui/Badges'
import { KeyFigure } from '@/components/ui/KeyFigure'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'
import type { Catalog } from '@/lib/catalog/catalog'
import { formatDate, formatPrice, specParts, type ValueLabels } from '@/lib/catalog/format'
import type { Listing } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

import { MailtoButton, ManufacturerLink } from './ContactLinks'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Sticky summary: title, status, provenance, four key figures, price, save/compare, contact. */
export async function SummaryPanel({ listing, catalog, url, labels }: { listing: Listing; catalog: Catalog; url: string; labels: ValueLabels }) {
  const t = await getTranslations('vehicle')
  const tLabels = await getTranslations('labels')
  const tSpecs = await getTranslations('specs')
  const locale = (await getLocale()) as Locale
  const brand = catalog.brandOf(listing)
  const type = catalog.typeOf(listing)
  const group = catalog.groupOf(type)
  const verified = catalog.isVerified(listing)
  const figures = catalog.keyFigureSpecs(listing)
  const price = listing.specs.price_eur
  const contact = catalog.showContact(listing) ? brand.contact : null

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-1 md:p-6">
      <h1 className="text-[clamp(26px,3vw,34px)] font-extrabold leading-[1.08]">
        <Link href={href.brand(brand.slug)} className="eyebrow mb-2 block font-sans hover:text-ink">
          {brand.name}
        </Link>
        {listing.model}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <StatusPill status={listing.availability} />
        <Link href={href.type(type, locale)} className="hover:text-ink hover:underline">
          {group.id !== type.id ? `${group.name} › ${type.name}` : type.name}
        </Link>
        {listing.demo && <DemoBadge />}
      </div>

      {verified ? (
        <p className="mt-4 flex items-start gap-2 rounded-box bg-good-soft px-3 py-2.5 text-[13.5px] text-good">
          <BadgeCheck size={17} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong>{tLabels('confirmedBy', { brand: brand.name })}</strong> · {formatDate(listing.verifiedAt, locale)}
          </span>
        </p>
      ) : (
        <p className="mt-4 flex items-start gap-2 text-[13px] text-muted">
          <Search size={15} className="mt-0.5 shrink-0" aria-hidden />
          {tLabels('publicSources')}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-2" aria-label={t('keyFigures')}>
        {figures.map((spec) => {
          const p = specParts(spec, listing.specs[spec.key], locale, labels)
          return <KeyFigure key={spec.key} label={spec.shortLabel} value={p?.value ?? null} unit={p?.unit} missingLabel={tSpecs('notPublished')} />
        })}
      </dl>

      <p className="mt-4 text-[14px]">
        {typeof price === 'number' ? (
          <>
            <span className="num text-[18px] font-semibold">{t('priceFrom', { price: formatPrice(price, locale) })}</span>{' '}
            <span className="text-muted">{t('priceNet')}</span>
          </>
        ) : (
          <span className="text-muted">{t('priceOnRequest')}</span>
        )}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SaveButton slug={listing.slug} title={listing.title} variant="button" className="w-full" />
        <CompareToggle slug={listing.slug} title={listing.title} variant="button" className="w-full" />
      </div>

      <div className="mt-5 border-t border-line pt-5">
        {contact ? (
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">
                {initials(contact.name ?? brand.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{contact.name ?? brand.name}</p>
                <p className="truncate text-[13px] text-muted">{[contact.role, brand.name].filter(Boolean).join(' · ')}</p>
              </div>
              {brand.demo && <DemoBadge />}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <MailtoButton brand={brand} listing={listing} url={url} className="flex-1" />
              <a href="#contact" className="link text-[13.5px]">
                {t('contact')}
              </a>
            </div>
          </div>
        ) : (
          <div className="text-[14px]">
            <p className="text-ink-2">{t('noContact')}</p>
            <p className="mt-1 text-[13px] text-muted">{t('noContactLead')}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-[13.5px]">
        {listing.sourceUrl && <ManufacturerLink url={listing.sourceUrl} brand={brand.name} listing={listing.slug} />}
        <Link href={href.correction(listing.slug)} className="link" rel="nofollow">
          {t('suggestCorrection')}
        </Link>
      </div>
    </div>
  )
}
