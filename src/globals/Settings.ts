import type { GlobalConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  admin: { group: 'System', hidden: ({ user }) => isPartnerUser(user) },
  access: { read: staffOnly, update: staffOnly },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            { name: 'tagline', type: 'text', localized: true },
            {
              name: 'notice',
              type: 'textarea',
              localized: true,
              admin: { description: 'Disclaimer in the footer and on listings.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'contactEmail', type: 'email', admin: { width: '50%' } },
                {
                  name: 'partnersEmail',
                  type: 'email',
                  admin: { width: '50%', description: 'For manufacturer enquiries.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Organisation (E-E-A-T)',
          description: 'Used in the Organization structured data and on the About page.',
          fields: [
            {
              name: 'organization',
              type: 'group',
              fields: [
                { name: 'legalName', type: 'text' },
                { name: 'logo', type: 'upload', relationTo: 'media' },
                {
                  name: 'sameAs',
                  type: 'array',
                  admin: { description: 'Profiles, e.g. LinkedIn.' },
                  fields: [{ name: 'url', type: 'text', required: true }],
                },
              ],
            },
            {
              name: 'owner',
              label: 'Person behind the site',
              type: 'group',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'role', type: 'text', localized: true },
                { name: 'bio', type: 'textarea', localized: true },
                { name: 'url', type: 'text', admin: { description: 'e.g. LinkedIn profile' } },
              ],
            },
          ],
        },
        {
          label: 'Open data',
          fields: [
            {
              name: 'openDataEnabled',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Publish /data with JSON and CSV downloads (docs/03 §6, decide in Phase 3).' },
            },
            {
              name: 'openDataLicence',
              type: 'text',
              defaultValue: 'CC BY 4.0',
              admin: { condition: (d) => Boolean(d?.openDataEnabled) },
            },
          ],
        },
      ],
    },
  ],
}
