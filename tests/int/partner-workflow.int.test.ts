/**
 * Manufacturer portal rules against a real database (Payload Local API with access control on):
 * partners see and edit only their own brand, every partner write is a draft, only staff publish.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Listing, User } from '@/payload-types'

const TAG = `int-${Date.now().toString(36)}`
const ctx = { skipRevalidate: true }

let payload: Payload
let partner: User & { collection: 'users' }
let editor: User & { collection: 'users' }
const created: { collection: 'change-requests' | 'listings' | 'users' | 'brands' | 'vehicle-types'; id: number }[] = []
let groupId: number
let typeId: number
let brandA: number
let brandB: number
let listingA: Listing
let listingB: Listing

const track = <T extends { id: number }>(collection: (typeof created)[number]['collection'], doc: T) => {
  created.push({ collection, id: doc.id })
  return doc
}

beforeAll(async () => {
  payload = await getPayload({ config })

  // On an empty database the first user becomes admin; create staff first either way.
  editor = {
    ...track(
      'users',
      await payload.create({
        collection: 'users',
        data: { email: `${TAG}-editor@example.com`, password: 'test-password-1', role: 'editor', name: 'Editor' },
        overrideAccess: true,
      }),
    ),
    collection: 'users',
  }

  const group = track(
    'vehicle-types',
    await payload.create({ collection: 'vehicle-types', data: { name: `${TAG} group`, slug: `${TAG}-group` }, context: ctx }),
  )
  groupId = group.id
  typeId = track(
    'vehicle-types',
    await payload.create({
      collection: 'vehicle-types',
      data: { name: `${TAG} type`, slug: `${TAG}-type`, parent: groupId },
      context: ctx,
    }),
  ).id

  const brand = (name: string) =>
    payload.create({
      collection: 'brands',
      data: { name, slug: name.toLowerCase(), partnership: { tier: 'free' }, _status: 'published' },
      context: ctx,
    })
  brandA = track('brands', await brand(`${TAG}-A`)).id
  brandB = track('brands', await brand(`${TAG}-B`)).id

  const listing = (brandId: number, model: string) =>
    payload.create({
      collection: 'listings',
      data: {
        brand: brandId,
        model,
        vehicleType: typeId,
        availability: 'on-sale',
        summary: 'Published summary.',
        _status: 'published',
      },
      context: ctx,
    })
  listingA = track('listings', await listing(brandA, 'Alpha'))
  listingB = track('listings', await listing(brandB, 'Beta'))

  const partnerDoc = track(
    'users',
    await payload.create({
      collection: 'users',
      data: { email: `${TAG}-partner@example.com`, password: 'test-password-1', role: 'partner', brand: brandA },
      overrideAccess: true,
    }),
  )
  partner = { ...partnerDoc, collection: 'users' }
})

afterAll(async () => {
  if (!payload) return
  const requests = await payload.find({
    collection: 'change-requests',
    where: { brand: { in: [brandA, brandB] } },
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })
  for (const r of requests.docs) created.unshift({ collection: 'change-requests', id: r.id })
  const extra = await payload.find({
    collection: 'listings',
    where: { brand: { in: [brandA, brandB] } },
    draft: true,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })
  for (const l of extra.docs) if (!created.some((c) => c.collection === 'listings' && c.id === l.id)) created.unshift({ collection: 'listings', id: l.id })

  const order = ['change-requests', 'listings', 'users', 'brands', 'vehicle-types'] as const
  const byOrder = [...created].sort((a, b) => order.indexOf(a.collection) - order.indexOf(b.collection) || b.id - a.id)
  for (const { collection, id } of byOrder) {
    await payload.delete({ collection, id, overrideAccess: true, context: ctx }).catch(() => undefined)
  }
  await payload.destroy?.()
})

const asPartner = { overrideAccess: false as const, get user() { return partner } }

describe('partner access', () => {
  it('sees only listings of its own brand', async () => {
    const res = await payload.find({ collection: 'listings', where: { brand: { in: [brandA, brandB] } }, ...asPartner })
    expect(res.docs.map((d) => d.id)).toEqual([listingA.id])
  })

  it('cannot save a published version', async () => {
    await expect(
      payload.update({ collection: 'listings', id: listingA.id, data: { summary: 'Changed.' }, ...asPartner }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'listings',
        id: listingA.id,
        draft: true,
        data: { summary: 'Changed.', _status: 'published' },
        ...asPartner,
      }),
    ).rejects.toThrow()
  })

  it('saves drafts that leave the live listing untouched and land in the review queue', async () => {
    await payload.update({
      collection: 'listings',
      id: listingA.id,
      draft: true,
      data: { summary: 'Draft summary from the manufacturer.' },
      ...asPartner,
    })
    const live = await payload.findByID({ collection: 'listings', id: listingA.id, overrideAccess: true })
    expect(live.summary).toBe('Published summary.')
    const draft = await payload.findByID({ collection: 'listings', id: listingA.id, draft: true, overrideAccess: true })
    expect(draft.summary).toBe('Draft summary from the manufacturer.')

    const queue = await payload.find({
      collection: 'change-requests',
      where: { listing: { equals: listingA.id }, kind: { equals: 'partner-edit' } },
      overrideAccess: true,
    })
    expect(queue.totalDocs).toBe(1)

    // A second draft save does not open a second request.
    await payload.update({ collection: 'listings', id: listingA.id, draft: true, data: { summary: 'Second draft.' }, ...asPartner })
    const again = await payload.count({
      collection: 'change-requests',
      where: { listing: { equals: listingA.id }, kind: { equals: 'partner-edit' } },
      overrideAccess: true,
    })
    expect(again.totalDocs).toBe(1)
  })

  it('cannot edit another brand, move a listing to another brand or set staff-only fields', async () => {
    await expect(
      payload.update({ collection: 'listings', id: listingB.id, draft: true, data: { summary: 'Hijack.' }, ...asPartner }),
    ).rejects.toThrow()

    await payload.update({
      collection: 'listings',
      id: listingA.id,
      draft: true,
      data: { brand: brandB, verifiedAt: '2026-01-01T00:00:00.000Z' },
      ...asPartner,
    })
    const draft = await payload.findByID({ collection: 'listings', id: listingA.id, draft: true, depth: 0, overrideAccess: true })
    expect(draft.brand).toBe(brandA)
    expect(draft.verifiedAt ?? null).toBeNull()
  })

  it('creates new models as drafts of its own brand', async () => {
    const doc = await payload.create({
      collection: 'listings',
      draft: true,
      data: { brand: brandB, model: 'Gamma', vehicleType: typeId, availability: 'announced', summary: 'New model.' },
      ...asPartner,
    })
    track('listings', doc)
    const stored = await payload.findByID({ collection: 'listings', id: doc.id, draft: true, depth: 0, overrideAccess: true })
    expect(stored.brand).toBe(brandA)
    expect(stored._status).toBe('draft')
  })

  it('cannot delete listings', async () => {
    await expect(payload.delete({ collection: 'listings', id: listingA.id, ...asPartner })).rejects.toThrow()
  })

  it('staff publish the reviewed draft', async () => {
    await payload.update({
      collection: 'listings',
      id: listingA.id,
      data: { summary: 'Approved summary.', _status: 'published' },
      overrideAccess: false,
      user: editor,
      context: ctx,
    })
    const live = await payload.findByID({ collection: 'listings', id: listingA.id, overrideAccess: true })
    expect(live.summary).toBe('Approved summary.')
  })
})
