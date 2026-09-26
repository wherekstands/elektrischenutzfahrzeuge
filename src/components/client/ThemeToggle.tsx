'use client'

import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    obs.disconnect()
    mq.removeEventListener('change', cb)
  }
}

const isDark = () => {
  const set = document.documentElement.dataset.theme
  return set ? set === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  const t = useTranslations('nav')
  const dark = useSyncExternalStore(subscribe, isDark, () => false)
  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('ecv:theme', next)
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('themeToggle')}
      title={dark ? t('themeLight') : t('themeDark')}
      className="grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-ink-2"
    >
      {dark ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  )
}

/** Inline script in <head>: applies the stored theme before first paint (no flash). */
export const themeScript = `try{var t=localStorage.getItem('ecv:theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`
