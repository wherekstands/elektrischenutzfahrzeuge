'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useRef, useTransition } from 'react'

/**
 * Progressive enhancement for the server-rendered filter form (method="get").
 * Without JavaScript the form submits normally. With JavaScript, changes apply instantly and the URL
 * stays in the canonical comma-separated format.
 */
export function FilterForm({ id, action, children, className }: { id: string; action: string; children: ReactNode; className?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const ref = useRef<HTMLFormElement>(null)

  const navigate = () => {
    const form = ref.current
    if (!form) return
    const values = new Map<string, string[]>()
    for (const [key, value] of new FormData(form).entries()) {
      const v = String(value).trim()
      if (!v || key === 'page') continue
      values.set(key, [...(values.get(key) ?? []), v])
    }
    const params = new URLSearchParams()
    for (const [k, vs] of values) params.set(k, [...new Set(vs)].join(','))
    const qs = params.toString()
    startTransition(() => router.push(qs ? `${action}?${qs}` : action, { scroll: false }))
  }

  return (
    <form
      ref={ref}
      id={id}
      action={action}
      method="get"
      className={className}
      data-pending={pending ? '' : undefined}
      aria-busy={pending}
      onChange={(e) => {
        const el = e.target as unknown as HTMLInputElement
        if (el.type === 'number' || el.type === 'search' || el.type === 'text') return
        navigate()
      }}
      onFocus={(e) => {
        const el = e.target as unknown as HTMLInputElement
        if (el.type === 'number') el.dataset.initial = el.value
      }}
      onBlur={(e) => {
        const el = e.target as unknown as HTMLInputElement
        if (el.type === 'number' && el.dataset.initial !== el.value) navigate()
      }}
      onSubmit={(e) => {
        e.preventDefault()
        navigate()
      }}
    >
      {children}
    </form>
  )
}

/** A select that lives outside the form (form="…") and submits it on change. */
export function SubmitOnChangeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { form: string }) {
  return (
    <select
      {...props}
      onChange={(e) => {
        props.onChange?.(e)
        const form = document.getElementById(props.form) as HTMLFormElement | null
        form?.requestSubmit()
      }}
    />
  )
}
