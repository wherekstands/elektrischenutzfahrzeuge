import { Link } from '@/i18n/navigation'
import type { Href } from '@/lib/urls'

/** Real links to sub-hubs (crawlable internal linking). */
export function TaxonomyChips({ items, label }: { items: { key: number | string; name: string; count: number; href: Href; current?: boolean }[]; label: string }) {
  if (!items.length) return null
  return (
    <nav aria-label={label} className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none md:flex-wrap md:overflow-visible">
      {items.map((i) => (
        <Link key={i.key} href={i.href} aria-current={i.current ? 'page' : undefined} className="chip shrink-0">
          {i.name}
          <span className="num text-[11.5px] opacity-60">{i.count}</span>
        </Link>
      ))}
    </nav>
  )
}
