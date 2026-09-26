import type { CollectionConfig } from 'payload'

import { isStaffUser, staffOrOwnUpload } from '@/access'
import { DOCUMENT_KINDS } from '@/lib/constants'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'language', 'filename', 'updatedAt'],
    description: 'Brochures, data sheets and price lists (PDF). Shown on listings of Starter and Pro partners.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: staffOrOwnUpload,
    delete: ({ req }) => isStaffUser(req.user),
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (req.user && operation === 'create') data.uploadedBy = req.user.id
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'brochure',
      options: DOCUMENT_KINDS.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
    },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: ['en', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'sv', 'da', 'multi'].map((value) => ({
        value,
        label: value === 'multi' ? 'Multilingual' : value.toUpperCase(),
      })),
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
