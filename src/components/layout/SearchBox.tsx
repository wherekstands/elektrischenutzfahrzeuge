'use client'

import { Search, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/** Compact index served by /[locale]/search-index.json: [label, path, keywords, context]. */
type Row = [string, string, string, string?]
type Index = { v: Row[]; t: Row[]; j: Row[]; b: Row[] }

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim()

function score(row: Row, tokens: string[]) {
  const label = ` ${norm(row[0])}`
  const hay = `${label} ${norm(row[2])} ${norm(row[3] ?? '')}`
  let s = 0
  for (const t of tokens) {
    if (label.includes(` ${t}`)) s += 3
    else if (hay.includes(` ${t}`)) s += 2
    else if (hay.includes(t)) s += 1
    else return 0
  }
  return s
}

let indexPromise: Promise<Index> | null = null

export function SearchBox({ action, className, autoFocus = false }: { action: string; className?: string; autoFocus?: boolean }) {
  const t = useTranslations('search')
  const locale = useLocale()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [index, setIndex] = useState<Index | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const load = useCallback(() => {
    if (!indexPromise) {
      indexPromise = fetch(`/${locale}/search-index.json`)
        .then((r) => r.json() as Promise<Index>)
        .catch(() => {
          indexPromise = null
          return { v: [], t: [], j: [], b: [] }
        })
    }
    indexPromise.then(setIndex)
  }, [locale])

  // "/" focuses the search from anywhere (except while typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) && !el.isContentEditable) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onDown = (e: MouseEvent) => wrapRef.current && !wrapRef.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const groups = useMemo(() => {
    const tokens = norm(q).split(' ').filter(Boolean)
    if (!index || !tokens.length) return []
    const top = (rows: Row[], n: number) =>
      rows
        .map((r) => ({ r, s: score(r, tokens) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, n)
        .map((x) => x.r)
    return [
      { key: 'types', label: t('types'), rows: top(index.t, 3) },
      { key: 'jobs', label: t('jobs'), rows: top(index.j, 3) },
      { key: 'brands', label: t('brands'), rows: top(index.b, 2) },
      { key: 'vehicles', label: t('vehicles'), rows: top(index.v, 6) },
    ].filter((g) => g.rows.length)
  }, [index, q, t])

  const flat = groups.flatMap((g) => g.rows)
  const go = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <form action={action} method="get" role="search" onSubmit={(e) => {
        if (active >= 0 && flat[active]) {
          e.preventDefault()
          go(flat[active][1])
        }
      }}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t('label')}
        </label>
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          name="q"
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={t('placeholder')}
          role="combobox"
          aria-expanded={open && q.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onFocus={() => {
            load()
            setOpen(true)
          }}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(flat.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(-1, a - 1))
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className="h-11 w-full rounded-full border border-line bg-surface-2 pl-10 pr-10 text-[14.5px] text-ink placeholder:text-muted focus:border-transparent focus:bg-surface focus:outline-2 focus:outline-accent [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ('')
              inputRef.current?.focus()
            }}
            aria-label={t('clear')}
            className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-3"
          >
            <X size={15} aria-hidden />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded border border-line-strong px-1.5 text-[11px] text-muted sm:block" title={t('shortcut')}>
            /
          </kbd>
        )}
      </form>

      {open && q.trim().length > 0 && (
        <div id={listId} role="listbox" aria-label={t('suggestions')} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-surface p-2 shadow-3">
          {index && !flat.length && <p className="px-3 py-2.5 text-[14px] text-muted">{t('noMatches')}</p>}
          {groups.map((g) => (
            <div key={g.key} role="group" aria-label={g.label} className="py-1">
              <p className="eyebrow px-3 pb-1 pt-1.5">{g.label}</p>
              {g.rows.map((r) => {
                const i = flat.indexOf(r)
                return (
                  <a
                    key={r[1]}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    href={r[1]}
                    onMouseEnter={() => setActive(i)}
                    onClick={(e) => {
                      e.preventDefault()
                      go(r[1])
                    }}
                    className={cn('flex items-baseline justify-between gap-3 rounded-box px-3 py-2 text-[14px]', i === active && 'bg-surface-2')}
                  >
                    <span className="truncate text-ink">{r[0]}</span>
                    {r[3] && <span className="shrink-0 truncate text-[12.5px] text-muted">{r[3]}</span>}
                  </a>
                )
              })}
            </div>
          ))}
          <a href={`${action}?q=${encodeURIComponent(q.trim())}`} className="mt-1 block rounded-box px-3 py-2 text-[14px] font-medium text-accent hover:bg-surface-2">
            {t('seeAll', { q: q.trim() })}
          </a>
        </div>
      )}
    </div>
  )
}
