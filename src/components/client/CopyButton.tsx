'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/cn'

export function CopyButton({
  value,
  label,
  copiedLabel,
  showText = false,
  className,
}: {
  value: string
  label: string
  copiedLabel: string
  showText?: boolean
  className?: string
}) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      window.setTimeout(() => setDone(false), 1800)
    } catch {
      window.prompt(label, value)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? copiedLabel : label}
      title={done ? copiedLabel : label}
      className={cn(
        showText ? 'btn btn-secondary btn-sm' : 'grid size-8 place-items-center rounded-full border border-line text-muted hover:border-ink-2 hover:text-ink',
        className,
      )}
    >
      {done ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      {showText && <span>{done ? copiedLabel : label}</span>}
    </button>
  )
}
