import Stripe from 'stripe'

import type { Tier } from './constants'

let client: Stripe | null = null

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY)

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set')
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY, { appInfo: { name: 'ECV Base' } })
  return client
}

/**
 * One recurring Stripe price per paid tier, billed per listed model per year (quantity = models).
 * Create them in the Stripe dashboard (EUR, yearly, per unit) and put the IDs into the environment.
 */
export const priceIdForTier = (tier: Tier): string | undefined =>
  tier === 'starter' ? process.env.STRIPE_PRICE_STARTER : tier === 'pro' ? process.env.STRIPE_PRICE_PRO : undefined

export const tierForPriceId = (priceId: string | null | undefined): Tier | null => {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro'
  if (priceId === process.env.STRIPE_PRICE_STARTER) return 'starter'
  return null
}

export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled'

/** Stripe statuses that end a partnership for good. */
const ENDED = new Set<Stripe.Subscription.Status>(['canceled', 'incomplete_expired', 'unpaid'])

/**
 * Map a subscription to the brand's partnership fields.
 * Only paid-up states unlock anything: `incomplete` (first payment failed or needs 3-D Secure) and
 * `paused` map to "none", which keeps the brand on free features until Stripe reports payment.
 */
export function partnershipFromSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0]
  const tier = tierForPriceId(item?.price?.id) ?? (sub.metadata?.tier as Tier | undefined) ?? null
  // Since API 2025-03-31 the billing period lives on the subscription item.
  const periodEnd =
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null
  const ended = ENDED.has(sub.status)
  const endTs = ended ? (sub.ended_at ?? periodEnd) : periodEnd
  const status: SubscriptionStatus = ended
    ? 'canceled'
    : sub.status === 'active'
      ? 'active'
      : sub.status === 'trialing'
        ? 'trialing'
        : sub.status === 'past_due'
          ? 'past_due'
          : 'none'
  return {
    tier: ended ? ('free' as Tier) : (tier ?? 'free'),
    subscriptionStatus: status,
    validUntil: endTs ? new Date(endTs * 1000).toISOString() : null,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    billedModels: item?.quantity ?? null,
  }
}

/** Statuses of a subscription that still counts as the brand's current one. */
export const isLiveSubscriptionStatus = (status: string | null | undefined) =>
  status === 'active' || status === 'trialing' || status === 'past_due'
