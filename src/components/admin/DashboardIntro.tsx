import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'
import React from 'react'

import { isPartnerUser, partnerBrandId } from '@/access'

type Props = { payload: Payload; user?: TypedUser | null }

const Stat = ({ label, value, href }: { label: string; value: number | string; href?: string }) => {
  const inner = (
    <>
      <div className="ecv-stat__value">{value}</div>
      <div className="ecv-stat__label">{label}</div>
    </>
  )
  return href ? (
    <Link className="ecv-stat" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="ecv-stat">{inner}</div>
  )
}

/** Dashboard header: review queue for staff, a short guide for manufacturer partners. */
export async function DashboardIntro({ payload, user }: Props) {
  if (!user) return null

  if (isPartnerUser(user)) {
    const brandId = partnerBrandId(user)
    if (brandId == null) return <p>Your account is not linked to a brand yet. Please contact us.</p>
    const [brand, published, drafts] = await Promise.all([
      payload.findByID({ collection: 'brands', id: brandId, depth: 0, overrideAccess: true }),
      payload.count({
        collection: 'listings',
        where: { and: [{ brand: { equals: brandId } }, { _status: { equals: 'published' } }] },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'change-requests',
        where: { and: [{ brand: { equals: brandId } }, { status: { in: ['new', 'in-review'] } }] },
        overrideAccess: true,
      }),
    ])
    const tier = brand.partnership?.tier ?? 'free'
    return (
      <div className="ecv-intro">
        <h2>Welcome, {brand.name}</h2>
        <p>
          Edit your listings and brand profile here. Your changes are saved as <strong>drafts</strong>; our
          editors review and publish them, usually within two working days. Spec values need a public source
          or your confirmation.
        </p>
        <div className="ecv-stats">
          <Stat label="Published models" value={published.totalDocs} href="/admin/collections/listings" />
          <Stat label="Changes waiting for review" value={drafts.totalDocs} href="/admin/collections/change-requests" />
          <Stat label="Partnership" value={tier[0].toUpperCase() + tier.slice(1)} href={`/admin/collections/brands/${brandId}`} />
        </div>
      </div>
    )
  }

  const [openRequests, draftListings, listings] = await Promise.all([
    payload.count({ collection: 'change-requests', where: { status: { in: ['new', 'in-review'] } } }),
    payload.count({ collection: 'listings', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'listings', where: { _status: { equals: 'published' } } }),
  ])
  return (
    <div className="ecv-intro">
      <h2>ECV Base editorial desk</h2>
      <div className="ecv-stats">
        <Stat
          label="Open change requests"
          value={openRequests.totalDocs}
          href="/admin/collections/change-requests?where[status][in][0]=new&where[status][in][1]=in-review"
        />
        <Stat
          label="Draft listings"
          value={draftListings.totalDocs}
          href="/admin/collections/listings?where[_status][equals]=draft"
        />
        <Stat label="Published listings" value={listings.totalDocs} href="/admin/collections/listings" />
      </div>
      <p className="ecv-muted">
        Taxonomy lives under <Link href="/admin/collections/vehicle-types">Vehicle types</Link>,{' '}
        <Link href="/admin/collections/jobs">Jobs</Link> and <Link href="/admin/collections/specs">Specs</Link>. See
        docs/taxonomy.md for the rules.
      </p>
    </div>
  )
}
