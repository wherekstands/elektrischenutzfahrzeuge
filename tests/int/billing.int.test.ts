/**
 * Stripe subscription → brand partnership, against a real database. Subscriptions are built locally;
 * nothing calls Stripe.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import type Stripe from 'stripe'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { syncBrandSubscription } from '@/endpoints/billing'
import { partnershipState } from '@/lib/catalog/partnership'

const TAG = `int-bill-${Date.now().toString(36)}`
const ctx = { skipRevalidate: true }
let payload: Payload
let brandId: number

const sub = (id: string, status: Stripe.Subscription.Status, over: Record<string, unknown> = {}) =>
  ({
    id,
    customer: `cus_${TAG}`,
    status,
    ended_at: status === 'canceled' ? Math.floor(Date.now() / 1000) : null,
    metadata: { brandId: String(brandId), tier: 'pro' },
    items: { data: [{ price: { id: 'price_x' }, quantity: 3, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400 }] },
    ...over,
  }) as unknown as Stripe.Subscription

const partnership = async () =>
  (await payload.findByID({ collection: 'brands', id: brandId, depth: 0, overrideAccess: true })).partnership

beforeAll(async () => {
  process.env.STRIPE_PRICE_PRO = 'price_x' // tier comes from the price, as in production
  payload = await getPayload({ config })
  brandId = (
    await payload.create({
      collection: 'brands',
      data: { name: TAG, slug: TAG, partnership: { tier: 'free' }, _status: 'published' },
      context: ctx,
    })
  ).id
})

afterAll(async () => {
  if (brandId) await payload.delete({ collection: 'brands', id: brandId, overrideAccess: true, context: ctx })
})

describe('syncBrandSubscription', () => {
  it('activates a paid partnership', async () => {
    expect(await syncBrandSubscription(payload, sub('sub_a', 'active'))).toBe('updated')
    const p = await partnership()
    expect(p).toMatchObject({ tier: 'pro', subscriptionStatus: 'active', stripeSubscriptionId: 'sub_a', billedModels: 3 })
    expect(partnershipState(p).active).toBe(true)
  })

  it('finds the brand by customer id when metadata is missing', async () => {
    expect(await syncBrandSubscription(payload, sub('sub_a', 'active', { metadata: {} }))).toBe('updated')
  })

  it('ignores a late cancellation of an older subscription', async () => {
    expect(await syncBrandSubscription(payload, sub('sub_old', 'canceled'))).toBe('ignored-stale')
    expect((await partnership()).stripeSubscriptionId).toBe('sub_a')
    expect(partnershipState(await partnership()).active).toBe(true)
  })

  it('does not unlock anything for an incomplete first payment', async () => {
    await syncBrandSubscription(payload, sub('sub_a', 'incomplete'))
    expect(partnershipState(await partnership()).active).toBe(false)
  })

  it('ends the partnership when the current subscription is cancelled', async () => {
    await syncBrandSubscription(payload, sub('sub_a', 'active'))
    await syncBrandSubscription(payload, sub('sub_a', 'canceled'))
    const p = await partnership()
    expect(p).toMatchObject({ tier: 'free', subscriptionStatus: 'canceled' })
    expect(partnershipState(p).active).toBe(false)
  })

  it('reports subscriptions without a brand', async () => {
    expect(await syncBrandSubscription(payload, sub('sub_z', 'active', { metadata: {}, customer: 'cus_unknown' }))).toBe('no-brand')
  })
})
