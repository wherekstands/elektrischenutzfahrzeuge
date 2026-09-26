'use client'

import { Link2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

import { useStoredList } from '@/components/client/store'

/**
 * The saved list lives in localStorage; the page renders the ids from the URL (shareable).
 * Without ids, restore the stored list into the URL, or show the empty state (children).
 */
export function SavedSync({ hasIds, children }: { hasIds: boolean; children?: ReactNode }) {
  const t = useTranslations('saved')
  const { items } = useStoredList('saved')
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    if (!hasIds && items.length) router.replace(`${pathname}?ids=${items.map((i) => i.slug).join(',')}`)
    setChecked(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIds, items.length])
  if (hasIds) return null
  if (!checked || items.length) return <p className="text-muted">{t('loading')}</p>
  return <>{children}</>
}

export function SavedActions() {
  const t = useTranslations('saved')
  const { clear } = useStoredList('saved')
  const router = useRouter()
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1800)
          } catch {
            window.prompt(t('share'), window.location.href)
          }
        }}
      >
        <Link2 size={14} aria-hidden />
        {copied ? '✓' : t('share')}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          clear()
          router.replace(pathname)
        }}
      >
        <Trash2 size={14} aria-hidden />
        {t('clear')}
      </button>
    </div>
  )
}
