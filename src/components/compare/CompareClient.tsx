'use client'

import { Download, Link2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useStoredList, type StoredItem } from '@/components/client/store'

/**
 * Keeps the URL (source of truth for the page) and the stored comparison in sync:
 * - no ids in the URL but items stored → show them;
 * - ids in the URL → they become the stored comparison.
 */
export function CompareSync({ items }: { items: StoredItem[] }) {
  const { items: stored, replace } = useStoredList('compare')
  const router = useRouter()
  const pathname = usePathname()
  const key = items.map((i) => i.slug).join(',')
  useEffect(() => {
    if (!items.length && stored.length) {
      router.replace(`${pathname}?ids=${stored.map((i) => i.slug).join(',')}`)
    } else if (items.length && stored.map((i) => i.slug).join(',') !== key) {
      replace(items)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

export function RemoveFromCompare({ slug, title, remaining }: { slug: string; title: string; remaining: string[] }) {
  const t = useTranslations('compare')
  const { remove } = useStoredList('compare')
  const router = useRouter()
  const pathname = usePathname()
  return (
    <button
      type="button"
      aria-label={t('remove', { title })}
      title={t('remove', { title })}
      onClick={() => {
        remove(slug)
        router.replace(remaining.length ? `${pathname}?ids=${remaining.join(',')}` : pathname)
      }}
      className="grid size-8 place-items-center rounded-full border border-line text-muted hover:border-ink-2 hover:text-ink"
    >
      <X size={15} aria-hidden />
    </button>
  )
}

export function DiffToggle({ target, initial }: { target: string; initial: boolean }) {
  const t = useTranslations('compare')
  const [on, setOn] = useState(initial)
  useEffect(() => {
    document.getElementById(target)?.setAttribute('data-diff', on ? '1' : '0')
  }, [on, target])
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px]">
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span className="h-6 w-10 rounded-full bg-surface-3 transition peer-checked:bg-accent" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-surface shadow-1 transition peer-checked:translate-x-4" />
      </span>
      {t('differencesOnly')}
    </label>
  )
}

export function CompareActions({ tableId, filename }: { tableId: string; filename: string }) {
  const t = useTranslations('compare')
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt(t('copyLink'), window.location.href)
    }
  }
  const csv = () => {
    const table = document.getElementById(tableId)
    if (!table) return
    const rows = [...table.querySelectorAll('tr')].map((tr) =>
      [...tr.querySelectorAll('th,td')].map((c) => `"${(c.textContent ?? '').replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`).join(','),
    )
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="btn btn-secondary btn-sm">
        <Link2 size={14} aria-hidden />
        {copied ? t('linkCopied') : t('copyLink')}
      </button>
      <button type="button" onClick={csv} className="btn btn-secondary btn-sm">
        <Download size={14} aria-hidden />
        {t('download')}
      </button>
    </div>
  )
}

export function ClearCompare({ label }: { label: string }) {
  const { clear } = useStoredList('compare')
  const router = useRouter()
  const pathname = usePathname()
  return (
    <button
      type="button"
      className="link text-[13.5px]"
      onClick={() => {
        clear()
        router.replace(pathname)
      }}
    >
      {label}
    </button>
  )
}
