import { Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { CopyButton } from '@/components/client/CopyButton'
import { DemoBadge } from '@/components/ui/Badges'
import { Link } from '@/i18n/navigation'
import type { Catalog } from '@/lib/catalog/catalog'
import type { Listing } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

import { MailtoButton, ManufacturerLink } from './ContactLinks'

export async function ContactSection({ listing, catalog, url }: { listing: Listing; catalog: Catalog; url: string }) {
  const t = await getTranslations('vehicle')
  const brand = catalog.brandOf(listing)
  const contact = catalog.showContact(listing) ? brand.contact : null
  const subject = t('mailSubject', { brand: brand.name, model: listing.model })

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-28">
      <h2 id="contact-title" className="text-[22px] font-bold">
        {t('contact')}
      </h2>
      {contact ? (
        <div className="mt-4 max-w-2xl rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow flex items-center gap-2">
              {t('contactAt', { brand: brand.name })}
              {brand.demo && <DemoBadge />}
            </p>
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{t('sponsoredContact')}</span>
          </div>
          <p className="mt-3 text-[17px] font-semibold">{contact.name ?? brand.name}</p>
          <p className="text-[13.5px] text-muted">{[contact.role, contact.region].filter(Boolean).join(' · ')}</p>
          <dl className="mt-4 space-y-2 text-[14.5px]">
            {contact.email && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">{t('email')}</dt>
                <Mail size={15} className="text-muted" aria-hidden />
                <dd className="num">{contact.email}</dd>
                <CopyButton value={contact.email} label={t('copy')} copiedLabel={t('copied')} />
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">{t('phone')}</dt>
                <Phone size={15} className="text-muted" aria-hidden />
                <dd className="num">
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </dd>
                <CopyButton value={contact.phone} label={t('copy')} copiedLabel={t('copied')} />
              </div>
            )}
          </dl>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[14.5px] text-ink-2">{t('contactLead', { name: contact.name?.split(' ')[0] ?? brand.name })}</p>
            <MailtoButton brand={brand} listing={listing} url={url} className="mt-3" label={t('writeEmail')} />
            <p className="mt-3 text-[12.5px] text-muted">{t('contactNote', { subject })}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 max-w-2xl rounded-card border border-line bg-surface p-5">
          <p className="text-ink-2">{t('noContact')}</p>
          <p className="mt-1 text-[14px] text-muted">{t('noContactLead')}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px]">
            {listing.sourceUrl && <ManufacturerLink url={listing.sourceUrl} brand={brand.name} listing={listing.slug} />}
            <Link href={href.manufacturers()} className="link">
              {t('claimListing', { brand: brand.name })}
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
