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

/** Map a subscription to the brand's partnership fields. */
export function partnershipFromSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0]
  const tier = tierForPriceId(item?.price?.id) ?? (sub.metadata?.tier as Tier | undefined) ?? null
  // Since API 2025-03-31 the billing period lives on the subscription item.
  const periodEnd =
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null
  const ended = sub.status === 'canceled' || sub.status === 'incomplete_expired' || sub.status === 'unpaid'
  const endTs = ended ? (sub.ended_at ?? periodEnd) : periodEnd
  return {
    tier: ended ? ('free' as Tier) : (tier ?? 'free'),
    subscriptionStatus: ended ? 'canceled' : sub.status === 'trialing' ? 'trialing' : sub.status === 'past_due' ? 'past_due' : 'active',
    validUntil: endTs ? new Date(endTs * 1000).toISOString() : null,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    billedModels: item?.quantity ?? null,
  }
}
