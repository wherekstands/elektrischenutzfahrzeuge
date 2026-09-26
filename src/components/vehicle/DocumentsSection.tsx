import { ArrowUpRight, FileText } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { DemoBadge } from '@/components/ui/Badges'
import type { Catalog } from '@/lib/catalog/catalog'
import type { Listing } from '@/lib/catalog/types'

/** Partner documents (Starter and Pro). The section always renders to keep the page structure fixed. */
export async function DocumentsSection({ listing, catalog }: { listing: Listing; catalog: Catalog }) {
  const t = await getTranslations('vehicle')
  const brand = catalog.brandOf(listing)
  const show = catalog.showDocuments(listing)
  return (
    <section id="documents" aria-labelledby="docs-title" className="scroll-mt-28">
      <h2 id="docs-title" className="flex items-center gap-2 text-[22px] font-bold">
        {t('documents')}
        {show && listing.demo && <DemoBadge />}
      </h2>
      {show ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {listing.documents.map((d, i) => (
            <li key={i}>
              <a href={d.url} target="_blank" rel="noopener" className="flex h-full items-start gap-3 rounded-card border border-line bg-surface p-4 transition hover:border-ink-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-box bg-accent-soft text-accent">
                  <FileText size={18} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug">{d.title}</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted">
                    {[d.kind[0].toUpperCase() + d.kind.slice(1), d.language?.toUpperCase(), t('documentFrom', { brand: brand.name })].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-card border border-dashed border-line-strong px-5 py-4 text-[14px] text-muted">
          {t('documentsEmpty', { brand: brand.name })}
        </p>
      )}
    </section>
  )
}
