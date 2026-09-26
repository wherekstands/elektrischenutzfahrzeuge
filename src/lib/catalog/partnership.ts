/**
 * Is a paid partnership in force? Pure, so the rules that decide what a brand gets are unit-tested.
 * Paid features need a paid tier, a paid-up subscription status (or "manual" invoicing) and a
 * `validUntil` date that has not passed. A lapsed partnership falls back to free features.
 */
import type { Tier } from '../constants'

export type PartnershipFields = {
  tier?: Tier | null
  subscriptionStatus?: string | null
  validUntil?: string | null
}

export const startOfToday = (now = new Date()) => {
  const d = new Date(now)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const PAID_UP = ['active', 'trialing', 'past_due', 'manual']

export function partnershipState(p: PartnershipFields | null | undefined, today = startOfToday()) {
  const tier = (p?.tier ?? 'free') as Tier
  if (tier === 'free') return { tier: 'free' as Tier, active: false }
  const statusOk = PAID_UP.includes(p?.subscriptionStatus ?? 'none')
  const until = p?.validUntil ? new Date(p.validUntil) : null
  // Manual (invoiced) partnerships may run without an end date; Stripe ones always have one.
  const dateOk = until ? until.getTime() >= today.getTime() : p?.subscriptionStatus === 'manual'
  const active = statusOk && dateOk
  return { tier: active ? tier : ('free' as Tier), active }
}
