'use client'

import { Link2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState, useSyncExternalStore } from 'react'

import { useStoredList } from '@/components/client/store'

const noop = () => () => {}
/** False during SSR and hydration, true afterwards (the stored list is only readable in the browser). */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false)

/**
 * The saved list lives in localStorage; the page renders the ids from the URL (shareable).
 * Without ids, restore the stored list into the URL, or show the empty state (children).
 */
export function SavedSync({ hasIds, children }: { hasIds: boolean; children?: ReactNode }) {
  const t = useTranslations('saved')
  const { items } = useStoredList('saved')
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydrated()
  const target = !hasIds && items.length ? `${pathname}?ids=${items.map((i) => i.slug).join(',')}` : null
  useEffect(() => {
    if (target) router.replace(target)
  }, [target, router])
  if (hasIds) return null
  if (!hydrated || items.length) return <p className="text-muted">{t('loading')}</p>
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
