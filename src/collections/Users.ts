import type { CollectionConfig } from 'payload'

import { adminFieldOnly, adminOnly, isAdminUser, isStaffUser } from '@/access'
import { USER_ROLES } from '@/lib/constants'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: {
    useAsTitle: 'email',
    group: 'System',
    defaultColumns: ['email', 'name', 'role', 'brand'],
    hidden: ({ user }) => !isStaffUser(user),
  },
  auth: {
    tokenExpiration: 60 * 60 * 12,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    // Everyone logged in may use the admin; partners get a reduced view (see collection `admin.hidden`).
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => {
      if (isStaffUser(req.user)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    create: adminOnly,
    update: ({ req }) => {
      if (isAdminUser(req.user)) return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // The very first account (created via /admin) becomes the owner.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'partner',
      saveToJWT: true,
      access: { update: adminFieldOnly, create: adminFieldOnly },
      options: USER_ROLES.map((r) => ({
        value: r,
        label: { admin: 'Owner / admin', editor: 'Editor', partner: 'Manufacturer partner' }[r],
      })),
      admin: {
        description:
          'Admins manage everything incl. users and billing. Editors edit and publish content. Partners edit their own brand as drafts that staff approve.',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      saveToJWT: true,
      access: { update: adminFieldOnly, create: adminFieldOnly },
      admin: {
        condition: (data) => data?.role === 'partner',
        description: 'Partners can only see and edit listings of this brand.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.role === 'partner' && !value ? 'Partner users need a brand.' : true,
    },
  ],
}
