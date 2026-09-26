import { ExternalLink, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { TrackedLink } from '@/components/client/TrackedLink'
import type { Brand, Listing } from '@/lib/catalog/types'
import { cn } from '@/lib/cn'

/** mailto: link with the standard subject "[ECV Base] <Brand> <Model>" (docs: no contact form, no lead routing). */
export async function MailtoButton({
  brand,
  listing,
  url,
  className,
  label,
}: {
  brand: Brand
  listing: Listing
  url: string
  className?: string
  label?: string
}) {
  const t = await getTranslations('vehicle')
  const contact = brand.contact!
  const subject = t('mailSubject', { brand: brand.name, model: listing.model })
  const body = t('mailBody', { name: contact.name ?? brand.name, title: listing.title, url })
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return (
    <TrackedLink href={mailto} event="Email contact" data={{ brand: brand.name, listing: listing.slug }} className={cn('btn btn-primary', className)}>
      <Mail size={16} aria-hidden />
      {label ?? (contact.name ? t('emailPerson', { name: contact.name.split(' ')[0] }) : t('emailBrand', { brand: brand.name }))}
    </TrackedLink>
  )
}

export async function ManufacturerLink({ url, brand, listing, className }: { url: string; brand: string; listing: string; className?: string }) {
  const t = await getTranslations('vehicle')
  return (
    <TrackedLink href={url} target="_blank" rel="noopener" event="Manufacturer page" data={{ brand, listing }} className={cn('link inline-flex items-center gap-1', className)}>
      <ExternalLink size={14} aria-hidden />
      {t('manufacturerPage')}
    </TrackedLink>
  )
}
