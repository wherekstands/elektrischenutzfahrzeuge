'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

/** Sidebar on desktop, full-screen drawer on mobile. */
export function FiltersShell({
  children,
  label,
  closeLabel,
  showLabel,
  activeCount,
  stateKey,
}: {
  children: ReactNode
  label: string
  closeLabel: string
  showLabel: string
  activeCount: number
  /** URL of the current filter state (from the server). A new state closes the drawer. */
  stateKey: string
}) {
  // The drawer closes when a filter was applied (new state from the server); derived, not synced in an
  // effect. Not useSearchParams(): that would opt the static hub pages out of server rendering.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === stateKey
  const setOpen = (next: boolean) => setOpenAt(next ? stateKey : null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenAt(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary btn-sm lg:hidden" aria-expanded={open}>
        <SlidersHorizontal size={15} aria-hidden />
        {label}
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-accent-ink">{activeCount}</span>
        )}
      </button>
      <div
        className={cn(
          'lg:static lg:block lg:bg-transparent lg:p-0',
          open ? 'fixed inset-0 z-[60] block overflow-y-auto bg-surface p-5 pb-28' : 'hidden',
        )}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label={open ? label : undefined}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-[18px] font-bold">{label}</p>
          <button type="button" onClick={() => setOpen(false)} aria-label={closeLabel} className="grid size-9 place-items-center rounded-full border border-line">
            <X size={18} aria-hidden />
          </button>
        </div>
        {children}
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface p-4 lg:hidden">
          <button type="button" onClick={() => setOpen(false)} className="btn btn-primary w-full">
            {showLabel}
          </button>
        </div>
      </div>
    </>
  )
}
