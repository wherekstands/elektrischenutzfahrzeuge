import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { FeaturedLabel } from '@/components/ui/Badges'
import { Link } from '@/i18n/navigation'
import type { Brand } from '@/lib/catalog/types'
import { href } from '@/lib/urls'

/** Paid brand spotlight. Labelled; the outbound link is rel="sponsored" (docs/03 §7). */
export async function Spotlight({ brand, modelCount }: { brand: Brand; modelCount: number }) {
  const t = await getTranslations('spotlight')
  const tHome = await getTranslations('home')
  return (
    <aside className="mt-10 flex flex-col gap-4 rounded-card border border-sponsored/30 bg-sponsored-soft/50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <FeaturedLabel />
        <p className="mt-2 font-display text-[20px] font-bold">{brand.name}</p>
        {brand.tagline && <p className="text-[14.5px] text-ink-2">{brand.tagline}</p>}
        <p className="text-[13px] text-muted">{tHome('models', { count: modelCount })}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={href.brand(brand.slug)} className="btn btn-secondary btn-sm">
          {t('models', { brand: brand.name })}
        </Link>
        {brand.website && (
          <a href={brand.website} rel="sponsored noopener" target="_blank" className="btn btn-primary btn-sm">
            {t('visit', { brand: brand.name })}
            <ArrowUpRight size={14} aria-hidden />
          </a>
        )}
      </div>
    </aside>
  )
}
