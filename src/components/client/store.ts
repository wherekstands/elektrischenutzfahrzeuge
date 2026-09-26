'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { MAX_COMPARE } from '@/lib/constants'

/**
 * Saved vehicles and the comparison live in localStorage only (no accounts, no cookies).
 * Items carry the title so the tray and header can render without a server round trip.
 */
export type StoredItem = { slug: string; title: string }
export type ListKind = 'saved' | 'compare'

const KEYS: Record<ListKind, string> = { saved: 'ecv:saved', compare: 'ecv:compare' }
const LIMIT: Record<ListKind, number> = { saved: 200, compare: MAX_COMPARE }
const EVENT = 'ecv:store'
const EMPTY: StoredItem[] = []

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function parse(raw: string | null): StoredItem[] {
  if (!raw) return EMPTY
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v)
      ? v.filter((x) => x && typeof x.slug === 'string').map((x) => ({ slug: x.slug, title: String(x.title ?? x.slug) }))
      : EMPTY
  } catch {
    return EMPTY
  }
}

const snapshots = new Map<string, { raw: string | null; value: StoredItem[] }>()
function snapshot(key: string): StoredItem[] {
  const raw = readRaw(key)
  const cached = snapshots.get(key)
  if (cached && cached.raw === raw) return cached.value
  const value = parse(raw)
  snapshots.set(key, { raw, value })
  return value
}

function write(key: string, items: StoredItem[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // Private mode or storage full: the list simply is not kept.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(EVENT, callback)
  }
}

export function useStoredList(kind: ListKind) {
  const key = KEYS[kind]
  const items = useSyncExternalStore(subscribe, () => snapshot(key), () => EMPTY)

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items])

  /** Returns false when the list is full. */
  const toggle = useCallback(
    (item: StoredItem): boolean => {
      const current = parse(readRaw(key))
      if (current.some((i) => i.slug === item.slug)) {
        write(key, current.filter((i) => i.slug !== item.slug))
        return true
      }
      if (current.length >= LIMIT[kind]) return false
      write(key, [...current, item])
      return true
    },
    [key, kind],
  )

  const remove = useCallback((slug: string) => write(key, parse(readRaw(key)).filter((i) => i.slug !== slug)), [key])
  const clear = useCallback(() => write(key, []), [key])
  const replace = useCallback((next: StoredItem[]) => write(key, next.slice(0, LIMIT[kind])), [key, kind])

  return { items, has, toggle, remove, clear, replace, limit: LIMIT[kind] }
}
