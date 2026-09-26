'use client'

import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'

import { useStoredList } from './store'

export function SaveButton({
  slug,
  title,
  variant = 'icon',
  className,
}: {
  slug: string
  title: string
  variant?: 'icon' | 'button'
  className?: string
}) {
  const t = useTranslations('card')
  const { has, toggle } = useStoredList('saved')
  const saved = has(slug)
  const label = saved ? t('unsaveLabel', { title }) : t('saveLabel', { title })

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={label}
        onClick={() => toggle({ slug, title })}
        className={cn('btn', saved ? 'btn-secondary' : 'btn-primary', className)}
      >
        <Star size={17} className={saved ? 'fill-amber text-amber' : ''} aria-hidden />
        {saved ? t('saved') : t('save')}
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={() => toggle({ slug, title })}
      className={cn(
        'grid size-9 place-items-center rounded-full border border-line bg-surface/90 text-ink-2 shadow-1 backdrop-blur transition hover:border-ink-2',
        className,
      )}
    >
      <Star size={17} className={saved ? 'fill-amber text-amber' : ''} aria-hidden />
    </button>
  )
}
