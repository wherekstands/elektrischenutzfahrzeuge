import type { Endpoint, PayloadRequest } from 'payload'
import type Stripe from 'stripe'

import { isPartnerUser, isStaffUser, partnerBrandId } from '@/access'
import type { Tier } from '@/lib/constants'
import { getStripe, partnershipFromSubscription, priceIdForTier, stripeEnabled } from '@/lib/stripe'

const json = (body: unknown, status = 200) => Response.json(body, { status })

async function readJson(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json?.()) ?? {}
  } catch {
    return {}
  }
}

/** Staff can bill any brand; partners only their own. */
function canBill(req: PayloadRequest, brandId: unknown) {
  if (isStaffUser(req.user)) return true
  return isPartnerUser(req.user) && String(partnerBrandId(req.user)) === String(brandId)
}

async function countListedModels(req: PayloadRequest, brandId: number | string) {
  const { totalDocs } = await req.payload.count({
    collection: 'listings',
    where: { and: [{ brand: { equals: brandId } }, { _status: { equals: 'published' } }] },
    overrideAccess: true,
    req,
  })
  return Math.max(1, totalDocs)
}

function adminUrl(req: PayloadRequest, brandId: number | string, query: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url || 'http://localhost:3000').origin
  return `${origin}/admin/collections/brands/${brandId}?${query}`
}

async function updateBrandFromSubscription(req: PayloadRequest, sub: Stripe.Subscription) {
  const data = partnershipFromSubscription(sub)
  let brandId: string | number | undefined = sub.metadata?.brandId
  if (!brandId) {
    const found = await req.payload.find({
      collection: 'brands',
      where: { 'partnership.stripeCustomerId': { equals: data.stripeCustomerId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    brandId = found.docs[0]?.id
  }
  if (!brandId) {
    req.payload.logger.warn(`Stripe subscription ${sub.id} has no matching brand`)
    return
  }
  const brand = await req.payload.findByID({ collection: 'brands', id: brandId, depth: 0, overrideAccess: true, req })
  await req.payload.update({
    collection: 'brands',
    id: brandId,
    overrideAccess: true,
    req,
    data: { partnership: { ...(brand.partnership ?? {}), ...data } },
  })
}

export const billingEndpoints: Endpoint[] = [
  {
    path: '/billing/checkout',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Not signed in' }, 401)
      if (!stripeEnabled()) return json({ error: 'Payments are not configured yet.' }, 503)
      const body = await readJson(req)
      const brandId = body.brandId as number | string
      const tier = body.tier as Tier
      if (!brandId || !canBill(req, brandId)) return json({ error: 'Not allowed' }, 403)
      const price = priceIdForTier(tier)
      if (!price) return json({ error: 'Unknown tier' }, 400)

      const stripe = getStripe()
      const brand = await req.payload.findByID({ collection: 'brands', id: brandId, depth: 0, overrideAccess: true, req })
      let customer = brand.partnership?.stripeCustomerId || undefined
      if (!customer) {
        const created = await stripe.customers.create({
          name: brand.name,
          email: req.user.email,
          metadata: { brandId: String(brandId) },
        })
        customer = created.id
        await req.payload.update({
          collection: 'brands',
          id: brandId,
          overrideAccess: true,
          req,
          data: { partnership: { ...(brand.partnership ?? {}), stripeCustomerId: customer } },
        })
      }
      const quantity = await countListedModels(req, brandId)
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer,
        line_items: [{ price, quantity }],
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: { enabled: true },
        customer_update: { name: 'auto', address: 'auto' },
        ...(process.env.STRIPE_AUTOMATIC_TAX === 'true' ? { automatic_tax: { enabled: true } } : {}),
        subscription_data: { metadata: { brandId: String(brandId), tier } },
        metadata: { brandId: String(brandId), tier },
        success_url: adminUrl(req, brandId, 'billing=success'),
        cancel_url: adminUrl(req, brandId, 'billing=cancelled'),
      })
      return json({ url: session.url })
    },
  },
  {
    path: '/billing/portal',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return json({ error: 'Not signed in' }, 401)
      if (!stripeEnabled()) return json({ error: 'Payments are not configured yet.' }, 503)
      const { brandId } = await readJson(req)
      if (!brandId || !canBill(req, brandId)) return json({ error: 'Not allowed' }, 403)
      const brand = await req.payload.findByID({
        collection: 'brands',
        id: brandId as number,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const customer = brand.partnership?.stripeCustomerId
      if (!customer) return json({ error: 'No billing account yet' }, 400)
      const session = await getStripe().billingPortal.sessions.create({
        customer,
        return_url: adminUrl(req, brandId as number, 'billing=portal'),
      })
      return json({ url: session.url })
    },
  },
  {
    // Staff: set the subscription quantity to the number of published listings (no proration).
    path: '/billing/sync',
    method: 'post',
    handler: async (req) => {
      if (!isStaffUser(req.user)) return json({ error: 'Not allowed' }, 403)
      if (!stripeEnabled()) return json({ error: 'Payments are not configured yet.' }, 503)
      const { brandId } = await readJson(req)
      const brand = await req.payload.findByID({
        collection: 'brands',
        id: brandId as number,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const subId = brand.partnership?.stripeSubscriptionId
      if (!subId) return json({ error: 'No subscription' }, 400)
      const stripe = getStripe()
      const sub = await stripe.subscriptions.retrieve(subId)
      const quantity = await countListedModels(req, brandId as number)
      const item = sub.items.data[0]
      if (item && item.quantity !== quantity) {
        await stripe.subscriptionItems.update(item.id, { quantity, proration_behavior: 'none' })
      }
      await updateBrandFromSubscription(req, await stripe.subscriptions.retrieve(subId))
      return json({ quantity })
    },
  },
  {
    path: '/stripe/webhook',
    method: 'post',
    handler: async (req) => {
      if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) return json({ error: 'Not configured' }, 503)
      const signature = req.headers.get('stripe-signature')
      const raw = await req.text?.()
      if (!signature || !raw) return json({ error: 'Missing signature' }, 400)
      const stripe = getStripe()
      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET)
      } catch (err) {
        return json({ error: `Invalid signature: ${(err as Error).message}` }, 400)
      }
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(
              typeof session.subscription === 'string' ? session.subscription : session.subscription.id,
            )
            await updateBrandFromSubscription(req, sub)
          }
          break
        }
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await updateBrandFromSubscription(req, event.data.object)
          break
        default:
          break
      }
      return json({ received: true })
    },
  },
]
