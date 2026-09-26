import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export type Crumb = { name: string; path?: string }

/** Visible breadcrumb (<nav aria-label="Breadcrumb">); the JSON-LD BreadcrumbList is emitted by the page. */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations('nav')
  return (
    <nav aria-label={t('breadcrumb')} className="text-[13.5px] text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.path && !last ? (
                <a href={c.path} className="hover:text-ink hover:underline">
                  {c.name}
                </a>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink-2' : ''}>
                  {c.name}
                </span>
              )}
              {!last && <ChevronRight size={13} className="text-faint" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
