import { getTranslations } from 'next-intl/server'

/** In-page anchors. Sticky under the header on large screens. */
export async function SectionNav() {
  const t = await getTranslations('vehicle')
  const tSpecs = await getTranslations('specs')
  const items: [string, string][] = [
    ['overview', t('overview')],
    ['specifications', tSpecs('title')],
    ['charging', t('charging')],
    ['documents', t('documents')],
    ['contact', t('contact')],
  ]
  return (
    <nav aria-label={t('sections')} className="sticky top-[68px] z-30 -mx-4 border-b border-line bg-[var(--glass)] px-4 backdrop-blur-xl md:mx-0 md:px-0">
      <ul className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
        {items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3.5 text-[14px] text-ink-2 hover:bg-surface-2">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
