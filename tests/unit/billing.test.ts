import type Stripe from 'stripe'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { partnershipState, startOfToday } from '@/lib/catalog/partnership'
import { partnershipFromSubscription } from '@/lib/stripe'

const PERIOD_END = Date.parse('2027-09-26T00:00:00Z') / 1000

const subscription = (over: Partial<Stripe.Subscription> & { price?: string; quantity?: number } = {}) =>
  ({
    id: 'sub_1',
    customer: 'cus_1',
    status: 'active',
    metadata: { brandId: '7', tier: 'starter' },
    ended_at: null,
    items: {
      data: [{ price: { id: over.price ?? 'price_pro' }, quantity: over.quantity ?? 12, current_period_end: PERIOD_END }],
    },
    ...over,
  }) as unknown as Stripe.Subscription

describe('partnershipFromSubscription', () => {
  const env = { ...process.env }
  beforeEach(() => {
    process.env.STRIPE_PRICE_PRO = 'price_pro'
    process.env.STRIPE_PRICE_STARTER = 'price_starter'
  })
  afterEach(() => {
    process.env = { ...env }
  })

  it('maps an active subscription: tier from the price, quantity = billed models, period end', () => {
    expect(partnershipFromSubscription(subscription())).toEqual({
      tier: 'pro',
      subscriptionStatus: 'active',
      validUntil: '2027-09-26T00:00:00.000Z',
      stripeSubscriptionId: 'sub_1',
      stripeCustomerId: 'cus_1',
      billedModels: 12,
    })
  })

  it('falls back to the tier in metadata for unknown prices', () => {
    expect(partnershipFromSubscription(subscription({ price: 'price_legacy' })).tier).toBe('starter')
  })

  it('never activates unpaid subscriptions', () => {
    for (const status of ['incomplete', 'paused'] as const) {
      const p = partnershipFromSubscription(subscription({ status }))
      expect(p.subscriptionStatus, status).toBe('none')
      expect(partnershipState(p, new Date('2026-09-26')).active, status).toBe(false)
    }
  })

  it('ends the partnership when the subscription ends', () => {
    for (const status of ['canceled', 'incomplete_expired', 'unpaid'] as const) {
      const p = partnershipFromSubscription(subscription({ status, ended_at: Date.parse('2026-10-01T00:00:00Z') / 1000 }))
      expect(p).toMatchObject({ tier: 'free', subscriptionStatus: 'canceled', validUntil: '2026-10-01T00:00:00.000Z' })
      expect(partnershipState(p).active).toBe(false)
    }
  })

  it('keeps paid features while Stripe retries a failed renewal (past_due)', () => {
    const p = partnershipFromSubscription(subscription({ status: 'past_due' }))
    expect(partnershipState(p, new Date('2026-09-26')).active).toBe(true)
  })
})

describe('partnershipState', () => {
  const today = startOfToday(new Date('2026-09-26T15:00:00Z'))

  it('free is never active', () => {
    expect(partnershipState({ tier: 'free', subscriptionStatus: 'active', validUntil: '2030-01-01' }, today)).toEqual({
      tier: 'free',
      active: false,
    })
    expect(partnershipState(undefined, today).active).toBe(false)
  })

  it('needs a paid-up status and a date that has not passed', () => {
    expect(partnershipState({ tier: 'pro', subscriptionStatus: 'active', validUntil: '2026-09-26' }, today)).toEqual({
      tier: 'pro',
      active: true,
    })
    expect(partnershipState({ tier: 'pro', subscriptionStatus: 'active', validUntil: '2026-09-25' }, today)).toEqual({
      tier: 'free',
      active: false,
    })
    expect(partnershipState({ tier: 'starter', subscriptionStatus: 'canceled', validUntil: '2030-01-01' }, today).active).toBe(false)
    expect(partnershipState({ tier: 'starter', subscriptionStatus: 'none', validUntil: '2030-01-01' }, today).active).toBe(false)
  })

  it('manual (invoiced) partnerships may run without an end date', () => {
    expect(partnershipState({ tier: 'starter', subscriptionStatus: 'manual', validUntil: null }, today).active).toBe(true)
    expect(partnershipState({ tier: 'starter', subscriptionStatus: 'active', validUntil: null }, today).active).toBe(false)
  })
})
