'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useEffect, useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'

type Layout = 'grid' | 'list'

const KEY = 'ecv:layout'
const listeners = new Set<() => void>()
/** Fallback when storage is unavailable (private mode, blocked cookies). */
let memory: Layout | null = null

function read(): Layout {
  if (memory) return memory
  try {
    return localStorage.getItem(KEY) === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

function write(layout: Layout) {
  memory = layout
  try {
    localStorage.setItem(KEY, layout)
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/** Grid / list view, remembered per visitor. Pure presentation: the same HTML is restyled. */
export function LayoutToggle({ target, gridLabel, listLabel }: { target: string; gridLabel: string; listLabel: string }) {
  const layout = useSyncExternalStore(subscribe, read, () => 'grid' as const)
  useEffect(() => {
    document.getElementById(target)?.setAttribute('data-layout', layout)
  }, [layout, target])
  const btn = 'grid size-8 place-items-center rounded-full transition'
  return (
    <div className="hidden items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 sm:flex" role="group">
      <button type="button" aria-pressed={layout === 'grid'} aria-label={gridLabel} title={gridLabel} onClick={() => write('grid')} className={cn(btn, layout === 'grid' ? 'bg-surface-3 text-ink' : 'text-muted')}>
        <LayoutGrid size={15} aria-hidden />
      </button>
      <button type="button" aria-pressed={layout === 'list'} aria-label={listLabel} title={listLabel} onClick={() => write('list')} className={cn(btn, layout === 'list' ? 'bg-surface-3 text-ink' : 'text-muted')}>
        <List size={15} aria-hidden />
      </button>
    </div>
  )
}
