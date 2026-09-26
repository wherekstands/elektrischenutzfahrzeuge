import type { CollectionAfterChangeHook } from 'payload'

import { isPartnerUser } from '@/access'

const idOf = (v: unknown): number | null =>
  v == null ? null : typeof v === 'object' ? ((v as { id: number }).id ?? null) : (v as number)

/**
 * A manufacturer partner saved a draft: put it into the staff review queue (change requests), once per
 * document while a request is open. Staff review the diff in the version history and publish.
 */
export const queuePartnerDraft =
  (kind: 'listing' | 'brand'): CollectionAfterChangeHook =>
  async ({ doc, req, operation }) => {
    if (!isPartnerUser(req.user) || doc._status !== 'draft') return doc
    const brandId = kind === 'brand' ? (doc.id as number) : idOf(doc.brand)
    if (brandId == null) return doc
    const open = await req.payload.count({
      collection: 'change-requests',
      where: {
        and: [
          kind === 'listing' ? { listing: { equals: doc.id } } : { listing: { exists: false } },
          { brand: { equals: brandId } },
          { kind: { equals: 'partner-edit' } },
          { status: { in: ['new', 'in-review'] } },
        ],
      },
      overrideAccess: true,
      req,
    })
    if (open.totalDocs > 0) return doc
    const what =
      kind === 'brand' ? `Brand profile: ${doc.name}` : `${operation === 'create' ? 'New listing' : 'Edit'}: ${doc.title}`
    await req.payload.create({
      collection: 'change-requests',
      overrideAccess: true,
      req,
      data: {
        kind: 'partner-edit',
        status: 'new',
        ...(kind === 'listing' ? { listing: doc.id } : {}),
        brand: brandId,
        title: what,
        submitter: { name: req.user?.name || req.user?.email, email: req.user?.email },
        message: 'A manufacturer partner saved a draft. Review the changes in the version history and publish.',
      },
    })
    return doc
  }
