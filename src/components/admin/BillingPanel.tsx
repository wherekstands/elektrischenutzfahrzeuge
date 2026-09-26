'use client'

import { Button, toast, useAuth, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React, { useState } from 'react'

type Tier = 'starter' | 'pro'

async function post(path: string, body: unknown): Promise<{ url?: string; error?: string; quantity?: number }> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json().catch(() => ({ error: `HTTP ${res.status}` }))
}

/** Upgrade / manage the Stripe subscription of a brand (per listed model per year). */
export function BillingPanel() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const [busy, setBusy] = useState<string | null>(null)
  const tier = useFormFields(([f]) => f['partnership.tier']?.value as string | undefined)
  const status = useFormFields(([f]) => f['partnership.subscriptionStatus']?.value as string | undefined)
  const customer = useFormFields(([f]) => f['partnership.stripeCustomerId']?.value as string | undefined)
  const isStaff = ['admin', 'editor'].includes((user as { role?: string } | null)?.role ?? '')

  if (!id) return null

  const go = async (key: string, path: string, body: unknown) => {
    setBusy(key)
    const res = await post(path, body)
    setBusy(null)
    if (res.url) window.location.assign(res.url)
    else if (res.quantity != null) toast.success(`Subscription set to ${res.quantity} models.`)
    else toast.error(res.error || 'Something went wrong')
  }

  const active = status === 'active' || status === 'trialing'
  return (
    <div className="ecv-billing">
      <h4>Billing</h4>
      <p className="ecv-muted">
        Partnerships are billed per listed model per year. Current tier: <strong>{tier ?? 'free'}</strong>
        {status && status !== 'none' ? ` (${status})` : ''}.
      </p>
      <div className="ecv-billing__actions">
        {!active &&
          (['starter', 'pro'] as Tier[]).map((t) => (
            <Button
              key={t}
              buttonStyle={t === 'pro' ? 'primary' : 'secondary'}
              disabled={busy !== null}
              onClick={() => go(t, '/billing/checkout', { brandId: id, tier: t })}
            >
              {busy === t ? 'Opening…' : `Choose ${t === 'pro' ? 'Pro' : 'Starter'}`}
            </Button>
          ))}
        {customer && (
          <Button
            buttonStyle="secondary"
            disabled={busy !== null}
            onClick={() => go('portal', '/billing/portal', { brandId: id })}
          >
            {busy === 'portal' ? 'Opening…' : 'Invoices & payment method'}
          </Button>
        )}
        {isStaff && active && (
          <Button
            buttonStyle="secondary"
            disabled={busy !== null}
            onClick={() => go('sync', '/billing/sync', { brandId: id })}
          >
            {busy === 'sync' ? 'Syncing…' : 'Sync billed models'}
          </Button>
        )}
      </div>
    </div>
  )
}
