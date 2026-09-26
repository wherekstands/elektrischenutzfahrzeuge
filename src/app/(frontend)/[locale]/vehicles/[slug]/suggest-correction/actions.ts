'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'

import { DEFAULT_LOCALE, isLocale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { getPayloadClient } from '@/lib/catalog/load'

export type CorrectionState = { status: 'idle' | 'ok' | 'error'; message?: 'tooShort' | 'error' }

const MIN_FILL_MS = 3000
const MAX_PER_HOUR = 5
const str = (v: FormDataEntryValue | null, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * Stores a correction suggestion in the review inbox (collection "change-requests").
 * Spam protection: honeypot field, minimum fill time, per-visitor hourly limit.
 */
export async function submitCorrection(_prev: CorrectionState, form: FormData): Promise<CorrectionState> {
  try {
    const localeRaw = str(form.get('locale'), 5)
    const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
    const slug = str(form.get('slug'), 200)
    // Honeypot and timing: silently accept bots so they learn nothing.
    if (str(form.get('website'))) return { status: 'ok' }
    const started = Number(str(form.get('started'), 20))
    if (!started || Date.now() - started < MIN_FILL_MS) return { status: 'ok' }

    const catalog = await getCatalog(locale)
    const listing = catalog.listingBySlug.get(slug)
    if (!listing) return { status: 'error', message: 'error' }

    const changes: { field: string; current: string; proposed: string }[] = []
    for (let i = 0; i < 5; i++) {
      const field = str(form.get(`field_${i}`), 100)
      const proposed = str(form.get(`proposed_${i}`), 300)
      if (!field || !proposed) continue
      const spec = catalog.specByKey.get(field)
      const current = spec ? JSON.stringify(listing.specs[field] ?? null) : field === 'summary' ? listing.summary : ''
      changes.push({ field: spec?.label ?? field, current, proposed })
    }
    const message = str(form.get('message'), 4000)
    if (!changes.length && message.length < 10) return { status: 'error', message: 'tooShort' }

    const h = await headers()
    const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
    const day = new Date().toISOString().slice(0, 10)
    const fingerprint = createHash('sha256').update(`${ip}|${h.get('user-agent') ?? ''}|${day}`).digest('hex').slice(0, 32)

    const payload = await getPayloadClient()
    const recent = await payload.count({
      collection: 'change-requests',
      where: {
        and: [{ fingerprint: { equals: fingerprint } }, { createdAt: { greater_than: new Date(Date.now() - 3600_000).toISOString() } }],
      },
      overrideAccess: true,
    })
    if (recent.totalDocs >= MAX_PER_HOUR) return { status: 'ok' }

    const relation = str(form.get('relation'), 20)
    await payload.create({
      collection: 'change-requests',
      overrideAccess: true,
      data: {
        kind: 'correction',
        status: 'new',
        title: `Correction: ${listing.title}`,
        listing: listing.id,
        brand: listing.brandId,
        locale,
        changes,
        message,
        sourceUrl: str(form.get('source'), 500) || undefined,
        submitter: {
          name: str(form.get('name'), 120) || undefined,
          email: str(form.get('email'), 200) || undefined,
          company: str(form.get('company'), 200) || undefined,
          relation: (['buyer', 'manufacturer', 'dealer', 'press', 'other'].includes(relation) ? relation : undefined) as
            | 'buyer'
            | 'manufacturer'
            | 'dealer'
            | 'press'
            | 'other'
            | undefined,
        },
        fingerprint,
      },
    })
    return { status: 'ok' }
  } catch (err) {
    console.error('Correction submit failed', err)
    return { status: 'error', message: 'error' }
  }
}
