'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { MAX_COMPARE } from '@/lib/constants'
import { href } from '@/lib/urls'

import { useStoredList } from './store'

/** Floating bar with the vehicles selected for comparison. Hidden on the compare page itself. */
export function CompareTray() {
  const t = useTranslations('compare')
  const { items, remove, clear } = useStoredList('compare')
  const pathname = usePathname()
  if (!items.length || pathname === '/compare') return null
  return (
    <div className="no-print fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div
        role="region"
        aria-label={t('tray')}
        className="fade-up flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-line bg-ink/95 p-1.5 pl-4 text-bg shadow-3 backdrop-blur scrollbar-none"
      >
        <span className="hidden text-[13px] opacity-70 sm:inline">{t('tray')}</span>
        {items.map((i) => (
          <span key={i.slug} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/10 pl-3 pr-1 text-[13px]">
            <span className="max-w-[160px] truncate">{i.title}</span>
            <button
              type="button"
              onClick={() => remove(i.slug)}
              aria-label={t('remove', { title: i.title })}
              className="grid size-6 place-items-center rounded-full hover:bg-white/15"
            >
              <X size={13} aria-hidden />
            </button>
          </span>
        ))}
        <button type="button" onClick={clear} aria-label={t('trayClear')} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/10">
          <X size={15} aria-hidden />
        </button>
        <Link
          href={href.compare(items.map((i) => i.slug))}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-amber px-4 text-[14px] font-semibold text-amber-ink"
        >
          {t('trayCompare', { count: items.length, max: MAX_COMPARE })}
        </Link>
      </div>
    </div>
  )
}
