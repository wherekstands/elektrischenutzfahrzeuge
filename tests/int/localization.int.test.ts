/**
 * Editing one language must never touch another. Regression: a hook called the Local API with
 * `locale: 'en'` and `req`, which switched the whole save to English, so German edits overwrote the
 * English text.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const TAG = `int-l10n-${Date.now().toString(36)}`
const ctx = { skipRevalidate: true }
let payload: Payload
const created: { collection: 'listings' | 'landing-pages' | 'brands' | 'vehicle-types' | 'jobs'; id: number }[] = []

const track = <T extends { id: number }>(collection: (typeof created)[number]['collection'], doc: T) => {
  created.unshift({ collection, id: doc.id })
  return doc
}

let typeId: number
let groupId: number
let jobId: number
let brandId: number

beforeAll(async () => {
  payload = await getPayload({ config })
  groupId = track('vehicle-types', await payload.create({ collection: 'vehicle-types', data: { name: `${TAG} group`, slug: `${TAG}-g` }, context: ctx })).id
  typeId = track(
    'vehicle-types',
    await payload.create({ collection: 'vehicle-types', data: { name: `${TAG} type`, slug: `${TAG}-t`, parent: groupId }, context: ctx }),
  ).id
  jobId = track('jobs', await payload.create({ collection: 'jobs', data: { name: `${TAG} job`, slug: `${TAG}-j` }, context: ctx })).id
  brandId = track(
    'brands',
    await payload.create({ collection: 'brands', data: { name: TAG, slug: TAG, partnership: { tier: 'free' }, _status: 'published' }, context: ctx }),
  ).id
})

afterAll(async () => {
  for (const { collection, id } of created) {
    await payload.delete({ collection, id, overrideAccess: true, context: ctx }).catch(() => undefined)
  }
})

describe('localized editing', () => {
  it('publishing a German listing edit keeps the English text', async () => {
    const listing = track(
      'listings',
      await payload.create({
        collection: 'listings',
        locale: 'en',
        data: {
          brand: brandId,
          model: 'Model L',
          vehicleType: typeId,
          availability: 'on-sale',
          summary: 'English summary.',
          documents: [{ title: 'Brochure', kind: 'brochure', url: 'https://example.com/b.pdf' }],
          _status: 'published',
        },
        context: ctx,
      }),
    )

    // German translation without translating the document title (falls back to English).
    await payload.update({
      collection: 'listings',
      id: listing.id,
      locale: 'de',
      data: { summary: 'Deutsche Zusammenfassung.', _status: 'published' },
      context: ctx,
    })

    const en = await payload.findByID({ collection: 'listings', id: listing.id, locale: 'en', fallbackLocale: false })
    const de = await payload.findByID({ collection: 'listings', id: listing.id, locale: 'de', fallbackLocale: false })
    expect(en.summary).toBe('English summary.')
    expect(de.summary).toBe('Deutsche Zusammenfassung.')
    expect(en.documents?.[0]?.title).toBe('Brochure')
  })

  it('still requires the document title in English', async () => {
    await expect(
      payload.create({
        collection: 'listings',
        locale: 'en',
        data: {
          brand: brandId,
          model: 'Model M',
          vehicleType: typeId,
          availability: 'on-sale',
          summary: 'x',
          documents: [{ kind: 'brochure', url: 'https://example.com/b.pdf' }],
          _status: 'published',
        },
        context: ctx,
      }),
    ).rejects.toThrow(/Title/)
  })

  it('a German landing-page edit keeps the English title', async () => {
    const page = track(
      'landing-pages',
      await payload.create({
        collection: 'landing-pages',
        locale: 'en',
        data: { vehicleType: groupId, job: jobId, title: 'English title', _status: 'published' },
        context: ctx,
      }),
    )
    await payload.update({
      collection: 'landing-pages',
      id: page.id,
      locale: 'de',
      data: { title: 'Deutscher Titel', _status: 'published' },
      context: ctx,
    })
    const en = await payload.findByID({ collection: 'landing-pages', id: page.id, locale: 'en', fallbackLocale: false })
    const de = await payload.findByID({ collection: 'landing-pages', id: page.id, locale: 'de', fallbackLocale: false })
    expect(en.title).toBe('English title')
    expect(de.title).toBe('Deutscher Titel')
    expect(en.internalTitle).toBe(`${TAG} group × ${TAG} job`)
  })
})
