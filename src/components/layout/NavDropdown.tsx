'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * Disclosure menu. The panel's links are rendered on the server (visible to crawlers); this component
 * only toggles visibility, closes on Escape, outside click and navigation.
 */
export function NavDropdown({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-1 rounded-full px-3 text-[14px] font-medium text-ink-2 transition hover:bg-surface-2',
          open && 'bg-surface-2 text-ink',
        )}
      >
        {label}
        <ChevronDown size={15} className={cn('transition', open && 'rotate-180')} aria-hidden />
      </button>
      <div
        id={id}
        hidden={!open}
        className={cn(
          'absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-card border border-line bg-surface p-5 shadow-3',
          wide ? 'w-[min(92vw,960px)]' : 'w-[min(92vw,560px)]',
        )}
      >
        {children}
      </div>
    </div>
  )
}
