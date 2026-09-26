'use client'

import { Check, Columns2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { cn } from '@/lib/cn'

import { useStoredList } from './store'

export function CompareToggle({
  slug,
  title,
  variant = 'chip',
  className,
}: {
  slug: string
  title: string
  variant?: 'chip' | 'button'
  className?: string
}) {
  const t = useTranslations('card')
  const { has, toggle } = useStoredList('compare')
  const [full, setFull] = useState(false)
  const on = has(slug)
  const label = on ? t('uncompareLabel', { title }) : t('compareLabel', { title })

  const onClick = () => {
    const ok = toggle({ slug, title })
    setFull(!ok)
    if (!ok) window.setTimeout(() => setFull(false), 2500)
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-pressed={on}
        aria-label={label}
        onClick={onClick}
        className={cn(
          variant === 'button' ? 'btn btn-secondary' : 'chip',
          on && variant === 'chip' && 'is-active',
          className,
        )}
      >
        {on ? <Check size={15} aria-hidden /> : <Columns2 size={15} aria-hidden />}
        {on ? t('inCompare') : t('compare')}
      </button>
      {full && (
        <span role="status" className="absolute bottom-full right-0 z-20 mb-2 w-56 rounded-box bg-ink p-2.5 text-xs text-bg shadow-3">
          {t('compareFull')}
        </span>
      )}
    </span>
  )
}
