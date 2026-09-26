'use client'

import { Bookmark, Columns2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { href } from '@/lib/urls'

import { useStoredList } from './store'

const Count = ({ n }: { n: number }) =>
  n > 0 ? (
    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-amber-ink">
      {n}
    </span>
  ) : null

/** Saved and Compare links with live counts. Links carry the ids so the pages render server-side. */
export function HeaderCounts() {
  const t = useTranslations('nav')
  const saved = useStoredList('saved')
  const compare = useStoredList('compare')
  const cls =
    'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium text-ink-2 transition hover:bg-surface-2'
  return (
    <>
      <Link href={href.saved(saved.items.map((i) => i.slug))} className={cls}>
        <Bookmark size={16} aria-hidden />
        <span className="hidden lg:inline">{t('saved')}</span>
        <Count n={saved.items.length} />
      </Link>
      <Link href={href.compare(compare.items.map((i) => i.slug))} className={cls}>
        <Columns2 size={16} aria-hidden />
        <span className="hidden lg:inline">{t('compare')}</span>
        <Count n={compare.items.length} />
      </Link>
    </>
  )
}
