import type { CollectionConfig } from 'payload'

import { isPartnerUser, isStaffUser, staffFieldOnly, staffOnly, staffOrOwnBrand } from '@/access'
import { slugField } from '@/fields/slug'
import { partnerDraftsOnly } from '@/hooks/partnerGuard'
import { recordRedirect } from '@/hooks/redirects'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { TIERS } from '@/lib/constants'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Brand', plural: 'Brands' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'partnership.tier', 'partnership.validUntil', 'country', 'updatedAt'],
    listSearchableFields: ['name', 'slug'],
    description:
      'One entry per brand as buyers know it (e.g. "Volvo" trucks and "Volvo CE" machines are separate brands). Partnership data drives badges, contacts, benefits and paid visibility.',
  },
  versions: { drafts: true, maxPerDoc: 30 },
  access: {
    read: staffOrOwnBrand('id'),
    create: staffOnly,
    update: staffOrOwnBrand('id'),
    delete: staffOnly,
  },
  hooks: {
    beforeOperation: [partnerDraftsOnly('id')],
    afterChange: [
      revalidateAfterChange,
      async ({ doc, previousDoc, req }) => {
        if (previousDoc?.slug && doc.slug && previousDoc.slug !== doc.slug && doc._status === 'published') {
          await recordRedirect(req, `/brands/${previousDoc.slug}`, `/brands/${doc.slug}`, 'Brand slug changed')
        }
        return doc
      },
    ],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, access: { update: staffFieldOnly } },
    { ...slugField({ from: 'name' }), access: { update: staffFieldOnly } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              type: 'row',
              fields: [
                { name: 'website', type: 'text', admin: { width: '60%' } },
                {
                  name: 'country',
                  type: 'text',
                  admin: { width: '40%', description: 'Country of origin, e.g. "Germany".' },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: { description: 'Two or three factual sentences shown on the brand page.' },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              maxLength: 120,
              admin: { description: 'One line for the brand spotlight (paid placement).' },
            },
          ],
        },
        {
          label: 'Contact',
          description:
            'Named contact shown on listings while the brand has an active Starter or Pro partnership. The contact button is a plain mailto: link with the subject "[ECV Base] <Brand> <Model>".',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', admin: { width: '50%' } },
                    { name: 'role', type: 'text', localized: true, admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'email', type: 'email', admin: { width: '50%' } },
                    { name: 'phone', type: 'text', admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'region',
                  type: 'text',
                  localized: true,
                  admin: { description: 'e.g. "Germany & Austria"' },
                },
              ],
            },
          ],
        },
        {
          label: 'Partnership',
          description:
            'Managed by staff and by Stripe webhooks. Payment never changes spec values; it only unlocks contact, badge, documents, benefits and visibility in "Recommended" and featured slots.',
          fields: [
            {
              name: 'partnership',
              type: 'group',
              access: { update: staffFieldOnly },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'tier',
                      type: 'select',
                      required: true,
                      defaultValue: 'free',
                      options: TIERS.map((value) => ({
                        value,
                        label: { free: 'Free', starter: 'Starter', pro: 'Pro' }[value],
                      })),
                      admin: { width: '33%' },
                    },
                    {
                      name: 'validUntil',
                      type: 'date',
                      admin: {
                        width: '33%',
                        description: 'Paid features switch off after this date.',
                        date: { pickerAppearance: 'dayOnly' },
                      },
                    },
                    {
                      name: 'subscriptionStatus',
                      type: 'select',
                      options: ['none', 'trialing', 'active', 'past_due', 'canceled', 'manual'].map((v) => ({
                        value: v,
                        label: v,
                      })),
                      defaultValue: 'none',
                      admin: {
                        width: '33%',
                        description: '"manual" = invoiced outside Stripe.',
                      },
                    },
                  ],
                },
                {
                  name: 'boostInRecommended',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description:
                      'Rank this brand’s listings higher in the default "Recommended" order (Pro before Starter before free). Always labelled "Sponsored".',
                  },
                },
                {
                  name: 'highlightCards',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Subtle emphasis on result cards (Pro only). Always labelled.' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'stripeCustomerId', type: 'text', admin: { readOnly: true, width: '50%' } },
                    { name: 'stripeSubscriptionId', type: 'text', admin: { readOnly: true, width: '50%' } },
                  ],
                },
                {
                  name: 'billedModels',
                  type: 'number',
                  admin: { readOnly: true, description: 'Quantity on the Stripe subscription.' },
                },
              ],
            },
            {
              name: 'billing',
              type: 'ui',
              admin: {
                components: { Field: '/components/admin/BillingPanel#BillingPanel' },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'demo',
      type: 'checkbox',
      defaultValue: false,
      access: { update: staffFieldOnly, create: staffFieldOnly },
      admin: {
        position: 'sidebar',
        description: 'Fictional sample partner data for development. Never use in production.',
        condition: (_data, _sibling, { user }) => isStaffUser(user) || !isPartnerUser(user),
      },
    },
    {
      name: 'listings',
      type: 'join',
      collection: 'listings',
      on: 'brand',
      admin: { defaultColumns: ['title', 'vehicleType', 'availability', '_status'] },
    },
  ],
}
