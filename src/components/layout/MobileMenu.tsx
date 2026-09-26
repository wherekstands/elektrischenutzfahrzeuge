'use client'

import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

export function MobileMenu({ openLabel, closeLabel, children }: { openLabel: string; closeLabel: string; children: ReactNode }) {
  const pathname = usePathname()
  // Remember where the menu was opened: navigating elsewhere closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const setOpen = (next: boolean) => setOpenAt(next ? pathname : null)
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenAt(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full border border-line text-ink-2 md:hidden"
      >
        <Menu size={18} aria-hidden />
      </button>
      <div hidden={!open} className="fixed inset-0 z-[60] md:hidden">
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
        <div role="dialog" aria-modal="true" aria-label={openLabel} className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto bg-surface p-5 shadow-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={closeLabel}
            className="mb-4 ml-auto grid size-9 place-items-center rounded-full border border-line"
          >
            <X size={18} aria-hidden />
          </button>
          {children}
        </div>
      </div>
    </>
  )
}
