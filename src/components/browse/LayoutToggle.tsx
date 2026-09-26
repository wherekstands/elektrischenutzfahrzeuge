'use client'

import { LayoutGrid, List } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

/** Grid / list view, remembered per visitor. Pure presentation: the same HTML is restyled. */
export function LayoutToggle({ target, gridLabel, listLabel }: { target: string; gridLabel: string; listLabel: string }) {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ecv:layout')
      if (stored === 'list') setLayout('list')
    } catch {}
  }, [])
  useEffect(() => {
    document.getElementById(target)?.setAttribute('data-layout', layout)
  }, [layout, target])
  const set = (l: 'grid' | 'list') => {
    setLayout(l)
    try {
      localStorage.setItem('ecv:layout', l)
    } catch {}
  }
  const btn = 'grid size-8 place-items-center rounded-full transition'
  return (
    <div className="hidden items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 sm:flex" role="group">
      <button type="button" aria-pressed={layout === 'grid'} aria-label={gridLabel} title={gridLabel} onClick={() => set('grid')} className={cn(btn, layout === 'grid' ? 'bg-surface-3 text-ink' : 'text-muted')}>
        <LayoutGrid size={15} aria-hidden />
      </button>
      <button type="button" aria-pressed={layout === 'list'} aria-label={listLabel} title={listLabel} onClick={() => set('list')} className={cn(btn, layout === 'list' ? 'bg-surface-3 text-ink' : 'text-muted')}>
        <List size={15} aria-hidden />
      </button>
    </div>
  )
}
