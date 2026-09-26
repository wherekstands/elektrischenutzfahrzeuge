import type { CollectionConfig } from 'payload'

import { isStaffUser, staffFieldOnly, staffOnly, staffOrOwnBrand } from '@/access'
import { CHANGE_REQUEST_KINDS, CHANGE_REQUEST_STATUSES } from '@/lib/constants'

/**
 * Review inbox: public "Suggest a correction" submissions, partner drafts waiting for approval and
 * "claim this listing" requests. Public submissions arrive via a server action (src/app/(frontend)/…),
 * never via the REST API.
 */
export const ChangeRequests: CollectionConfig = {
  slug: 'change-requests',
  labels: { singular: 'Change request', plural: 'Change requests' },
  admin: {
    group: 'Partners & review',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'status', 'listing', 'createdAt'],
    listSearchableFields: ['title', 'message'],
    description: 'Corrections from visitors and partner drafts waiting for review.',
  },
  defaultSort: '-createdAt',
  access: {
    read: staffOrOwnBrand('brand'),
    create: staffOnly,
    update: staffOnly,
    delete: ({ req }) => isStaffUser(req.user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'correction',
          options: CHANGE_REQUEST_KINDS.map((value) => ({
            value,
            label: { correction: 'Correction', 'partner-edit': 'Partner draft', claim: 'Claim listing' }[value],
          })),
          admin: { width: '33%' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: CHANGE_REQUEST_STATUSES.map((value) => ({ value, label: value })),
          admin: { width: '33%' },
        },
        { name: 'locale', type: 'text', admin: { width: '33%', readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'listing', type: 'relationship', relationTo: 'listings', admin: { width: '50%' } },
        { name: 'brand', type: 'relationship', relationTo: 'brands', admin: { width: '50%' } },
      ],
    },
    {
      name: 'changes',
      type: 'array',
      admin: { description: 'Field-level suggestions.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'field', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'current', type: 'text', admin: { width: '35%' } },
            { name: 'proposed', type: 'text', admin: { width: '35%' } },
          ],
        },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'sourceUrl', type: 'text' },
    {
      name: 'submitter',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', admin: { width: '33%' } },
            { name: 'email', type: 'email', admin: { width: '33%' } },
            { name: 'company', type: 'text', admin: { width: '34%' } },
          ],
        },
        {
          name: 'relation',
          type: 'select',
          options: [
            { value: 'buyer', label: 'Buyer / fleet' },
            { value: 'manufacturer', label: 'Manufacturer / importer' },
            { value: 'dealer', label: 'Dealer' },
            { value: 'press', label: 'Press / research' },
            { value: 'other', label: 'Other' },
          ],
        },
      ],
    },
    {
      name: 'internalNote',
      type: 'textarea',
      access: { read: staffFieldOnly, update: staffFieldOnly },
    },
    { name: 'fingerprint', type: 'text', admin: { hidden: true }, index: true },
  ],
}
