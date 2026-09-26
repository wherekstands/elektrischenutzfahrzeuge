import { Forbidden, type CollectionBeforeOperationHook } from 'payload'

import { isPartnerUser, partnerBrandId } from '@/access'

/**
 * Manufacturer partners may only save drafts; staff publish (docs: "partner edits become drafts that the
 * owner approves"). Access control alone cannot see the `draft` flag, so we enforce it here where the full
 * operation arguments are available. A non-draft write by a partner would otherwise overwrite or unpublish
 * the live document.
 */
export const partnerDraftsOnly =
  (brandField = 'brand'): CollectionBeforeOperationHook =>
  ({ args, operation, req }) => {
    if (!isPartnerUser(req.user)) return args
    if (operation === 'create' || operation === 'update' || operation === 'updateByID') {
      const a = args as { draft?: boolean; data?: Record<string, unknown> }
      if (!a.draft || a.data?._status === 'published') {
        throw new Forbidden(req.t)
      }
      if (operation === 'create' && a.data) {
        // New models are always created for the partner's own brand.
        a.data[brandField] = partnerBrandId(req.user)
        a.data._status = 'draft'
      }
    }
    if (operation === 'delete' || operation === 'deleteByID') throw new Forbidden(req.t)
    return args
  }
