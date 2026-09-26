import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

import type { UserRole } from '@/lib/constants'

type MaybeUser = PayloadRequest['user'] & { role?: UserRole | null; brand?: unknown }

export const roleOf = (user: unknown): UserRole | null =>
  ((user as MaybeUser | null)?.role as UserRole | undefined) ?? null

export const isAdminUser = (user: unknown) => roleOf(user) === 'admin'
/** Owner/admin and editors: full editorial rights including publishing. */
export const isStaffUser = (user: unknown) => roleOf(user) === 'admin' || roleOf(user) === 'editor'
export const isPartnerUser = (user: unknown) => roleOf(user) === 'partner'

/** The brand id a partner user belongs to (relationship may be populated or not). */
export const partnerBrandId = (user: unknown): number | string | null => {
  const brand = (user as MaybeUser | null)?.brand
  if (brand == null) return null
  if (typeof brand === 'object') return (brand as { id: number | string }).id
  return brand as number | string
}

export const anyone: Access = () => true
export const staffOnly: Access = ({ req }) => isStaffUser(req.user)
export const adminOnly: Access = ({ req }) => isAdminUser(req.user)
export const authenticated: Access = ({ req }) => Boolean(req.user)

export const staffFieldOnly: FieldAccess = ({ req }) => isStaffUser(req.user)
export const adminFieldOnly: FieldAccess = ({ req }) => isAdminUser(req.user)

/**
 * Staff see everything; partners only documents of their own brand (via the given field).
 * Anonymous users get nothing: the public website reads through the Local API, not REST.
 */
export const staffOrOwnBrand =
  (brandField = 'brand'): Access =>
  ({ req }) => {
    if (isStaffUser(req.user)) return true
    if (isPartnerUser(req.user)) {
      const brand = partnerBrandId(req.user)
      if (brand == null) return false
      return { [brandField]: { equals: brand } } as Where
    }
    return false
  }

/** Staff, or partner users for files they uploaded themselves. */
export const staffOrOwnUpload: Access = ({ req }) => {
  if (isStaffUser(req.user)) return true
  if (isPartnerUser(req.user) && req.user) return { uploadedBy: { equals: req.user.id } } as Where
  return false
}
