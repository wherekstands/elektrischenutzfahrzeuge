import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

const PATH = /^\/[a-z0-9\-/]*$/

/** Permanent redirects for changed slugs. Paths are internal (without locale), e.g. /vehicles/old-slug. */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'System',
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'reason', 'updatedAt'],
    description: 'Created automatically when a published slug changes. Paths without locale, e.g. /vehicles/old.',
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      validate: (v: unknown) => (typeof v === 'string' && PATH.test(v) ? true : 'Path like /vehicles/old-slug'),
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      validate: (v: unknown) => (typeof v === 'string' && PATH.test(v) ? true : 'Path like /vehicles/new-slug'),
    },
    { name: 'reason', type: 'text' },
  ],
}
