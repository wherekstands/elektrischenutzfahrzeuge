import 'server-only'

import { getTranslations } from 'next-intl/server'

import type { Locale } from '../../i18n/config'
import type { Catalog } from '../catalog/catalog'
import { formatDate, formatSpec } from '../catalog/format'
import { factSentences } from '../catalog/sentences'
import type { Listing } from '../catalog/types'
import { SPEC_GROUPS } from '../constants'
import { SITE_NAME } from '../env'
import { absolute, href, pathFor } from '../urls'

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

export async function valueLabelsFor(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'specs' })
  return { yes: t('yes'), no: t('no'), std: t('std'), opt: t('opt'), notAvailable: t('notAvailable') }
}

/** Markdown twin of a vehicle page (docs/03 §6): same facts, source and last-verified date. */
export async function listingMarkdown(listing: Listing, catalog: Catalog, locale: Locale): Promise<string> {
  const t = await getTranslations({ locale, namespace: 'vehicle' })
  const tSpecs = await getTranslations({ locale, namespace: 'specs' })
  const tFacts = await getTranslations({ locale, namespace: 'facts' })
  const tLabels = await getTranslations({ locale, namespace: 'labels' })
  const tStatus = await getTranslations({ locale, namespace: 'status' })
  const labels = await valueLabelsFor(locale)
  const brand = catalog.brandOf(listing)
  const type = catalog.typeOf(listing)
  const group = catalog.groupOf(type)
  const url = absolute(pathFor(locale, href.vehicle(listing.slug)))
  const sentences = factSentences(listing, catalog, locale, (k, v) => tFacts(k as never, v as never), (k) => tFacts.has(k as never), labels)
  const verified = catalog.isVerified(listing)

  const lines: string[] = []
  lines.push(`# ${listing.title}`, '')
  lines.push(`> ${listing.summary}`, '')
  lines.push(sentences.join(' '), '')
  lines.push(`- ${t('type')}: ${group.id !== type.id ? `${group.name} › ${type.name}` : type.name}`)
  lines.push(`- ${tStatus(listing.availability)}`)
  const jobs = catalog.jobsOf(listing).map((j) => j.name)
  if (jobs.length) lines.push(`- ${t('usedFor')}: ${jobs.join(', ')}`)
  lines.push(`- URL: ${url}`, '')

  if (listing.keyFacts.length) {
    lines.push(`## ${t('keyFacts')}`, '')
    for (const f of listing.keyFacts) lines.push(`- ${f}`)
    lines.push('')
  }
  if (catalog.showBenefits(listing)) {
    lines.push(`## ${t('benefits')} (${t('benefitsBy', { brand: brand.name })})`, '')
    for (const b of listing.keyBenefits) lines.push(`- ${b}`)
    lines.push('')
  }

  lines.push(`## ${tSpecs('title')}`, '')
  const specs = catalog.profileSpecs(listing)
  for (const g of SPEC_GROUPS) {
    const rows = specs
      .filter((s) => s.group === g)
      .map((s) => [s.label, formatSpec(s, listing.specs[s.key], locale, labels)] as const)
      .filter(([, v]) => v != null)
    if (!rows.length) continue
    lines.push(`### ${tSpecs(`groups.${g}`)}`, '', '| | |', '|---|---|')
    for (const [label, value] of rows) lines.push(`| ${cell(label)} | ${cell(value!)} |`)
    lines.push('')
  }

  lines.push(`## ${t('sources')}`, '')
  lines.push(
    verified ? tLabels('confirmedOn', { brand: brand.name, date: formatDate(listing.verifiedAt, locale) }) : tLabels('publicSources'),
  )
  lines.push(t('lastUpdated', { date: formatDate(listing.updatedAt, locale) }), '')
  if (listing.sourceUrl) lines.push(`- ${t('manufacturerPage')}: ${listing.sourceUrl}`)
  for (const s of listing.sources) lines.push(`- ${s.label}: ${s.url}`)
  lines.push('', `${t('notice')} ${SITE_NAME}, ${url}`, '')
  return lines.join('\n')
}
