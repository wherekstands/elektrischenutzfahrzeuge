import { getTranslations } from 'next-intl/server'

import { DEFAULT_LOCALE } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { factSentences } from '@/lib/catalog/sentences'
import { SITE_NAME } from '@/lib/env'
import { valueLabelsFor } from '@/lib/seo/markdown'
import { absoluteFor, href } from '@/lib/urls'

/** Every vehicle as a short, citable paragraph with its URL. */
export const dynamic = 'force-static'

export async function GET() {
  const locale = DEFAULT_LOCALE
  const c = await getCatalog(locale)
  const tFacts = await getTranslations({ locale, namespace: 'facts' })
  const labels = await valueLabelsFor(locale)
  const blocks = [`# ${SITE_NAME}: all vehicles`, '']
  const byGroup = [...c.listings].sort(
    (a, b) => c.groupOf(c.typeOf(a)).order - c.groupOf(c.typeOf(b)).order || a.title.localeCompare(b.title),
  )
  for (const l of byGroup) {
    const sentences = factSentences(l, c, locale, (k, v) => tFacts(k as never, v as never), (k) => tFacts.has(k as never), labels)
    blocks.push(`## ${l.title}`, '', `${l.summary} ${sentences.join(' ')}`, '', `URL: ${absoluteFor(locale, href.vehicle(l.slug))}`, '')
  }
  return new Response(blocks.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
