import { BadgeCheck, Megaphone, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Status } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { href } from '@/lib/urls'

const statusStyle: Record<Status, string> = {
  'on-sale': 'bg-good-soft text-good',
  'orders-open': 'bg-accent-soft text-accent',
  announced: 'bg-warn-soft text-warn',
  discontinued: 'bg-surface-3 text-muted',
}

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations('status')
  return (
    <span className={cn('pill', statusStyle[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {t(status)}
    </span>
  )
}

export function VerifiedBadge({ brand, compact = false }: { brand: string; compact?: boolean }) {
  const t = useTranslations('labels')
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-good" title={t('confirmedBy', { brand })}>
      <BadgeCheck size={14} aria-hidden />
      {compact ? t('confirmed') : t('confirmedBy', { brand })}
    </span>
  )
}

/** Label for positions influenced by payment (UCPD Annex I 11a, § 5b UWG). Links to the explanation. */
export function SponsoredLabel({ className }: { className?: string }) {
  const t = useTranslations('labels')
  return (
    <Link href={href.ranking()} className={cn('label-sponsored no-underline', className)} title={t('sponsoredHint')}>
      <Megaphone size={11} aria-hidden />
      {t('sponsored')}
    </Link>
  )
}

export function FeaturedLabel({ className }: { className?: string }) {
  const t = useTranslations('labels')
  return (
    <Link href={href.ranking()} className={cn('label-sponsored no-underline', className)} title={t('featuredHint')}>
      <Sparkles size={11} aria-hidden />
      {t('featuredPartner')}
    </Link>
  )
}

export function DemoBadge() {
  const t = useTranslations('labels')
  return (
    <span className="pill bg-amber-soft text-[10.5px] tracking-[0.05em] text-amber-ink uppercase" title={t('demoHint')}>
      {t('demo')}
    </span>
  )
}
