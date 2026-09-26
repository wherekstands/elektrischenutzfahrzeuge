import type { GlobalConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'
import { TIERS } from '@/lib/constants'

/** Partner tiers as shown on /for-manufacturers. Stripe price IDs live in environment variables. */
export const Pricing: GlobalConfig = {
  slug: 'pricing',
  label: 'Partner pricing',
  admin: { group: 'Partners & review', hidden: ({ user }) => isPartnerUser(user) },
  access: { read: staffOnly, update: staffOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'tiers',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'tier',
              type: 'select',
              required: true,
              options: TIERS.map((v) => ({ value: v, label: v })),
              admin: { width: '25%' },
            },
            { name: 'name', type: 'text', required: true, localized: true, admin: { width: '25%' } },
            {
              name: 'pricePerModelYear',
              type: 'number',
              admin: { width: '25%', description: 'EUR net per listed model per year. 0 = free.' },
            },
            { name: 'highlight', type: 'checkbox', admin: { width: '25%' } },
          ],
        },
        { name: 'description', type: 'text', localized: true },
        {
          name: 'features',
          type: 'array',
          localized: true,
          fields: [
            { name: 'text', type: 'text', required: true },
            { name: 'included', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      localized: true,
      admin: { description: 'Small print under the tiers, e.g. "Prices are net. Working assumption, to be confirmed."' },
    },
  ],
}
