import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { PLACEMENT_KINDS } from '@/lib/constants'

/**
 * Paid visibility (featured slots and brand spotlights). Every placement is labelled "Featured partner"
 * on the site and outbound links use rel="sponsored". Placements only render while the brand has an
 * active paid partnership and the date range is current. See /how-ranking-works.
 */
export const Placements: CollectionConfig = {
  slug: 'placements',
  labels: { singular: 'Placement', plural: 'Paid placements' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Partners & review',
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'brand', 'startsAt', 'endsAt', 'active'],
    description:
      'Featured listings (1–2 highlighted cards at the top of hubs and the home page) and brand spotlights. Always labelled on the site.',
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Internal, e.g. "Kia PV5 – vans hub Q4".' } },
    {
      type: 'row',
      fields: [
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'featured-listing',
          options: PLACEMENT_KINDS.map((value) => ({
            value,
            label: { 'featured-listing': 'Featured listing(s)', 'brand-spotlight': 'Brand spotlight' }[value],
          })),
          admin: { width: '50%' },
        },
        { name: 'brand', type: 'relationship', relationTo: 'brands', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'listings',
      type: 'relationship',
      relationTo: 'listings',
      hasMany: true,
      maxRows: 2,
      filterOptions: ({ siblingData }) => {
        const brand = (siblingData as { brand?: unknown })?.brand
        const id = brand && typeof brand === 'object' ? (brand as { id: number }).id : brand
        return id ? { brand: { equals: id } } : true
      },
      admin: { condition: (_d, s) => s?.kind === 'featured-listing' },
    },
    {
      type: 'collapsible',
      label: 'Where',
      fields: [
        { name: 'onHome', type: 'checkbox', label: 'Home page', defaultValue: false },
        { name: 'onBrandHub', type: 'checkbox', label: 'The brand’s own page', defaultValue: false },
        { name: 'onGuides', type: 'checkbox', label: 'Guides', defaultValue: false },
        {
          name: 'vehicleTypes',
          type: 'relationship',
          relationTo: 'vehicle-types',
          hasMany: true,
          admin: { description: 'Type or group hubs (a group includes its types).' },
        },
        {
          name: 'jobs',
          type: 'relationship',
          relationTo: 'jobs',
          hasMany: true,
          admin: { description: 'Job or area hubs (an area includes its jobs).' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'endsAt', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'priority', type: 'number', defaultValue: 0, admin: { width: '34%', description: 'Higher wins.' } },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'note', type: 'textarea', admin: { description: 'Internal: order number, contact, price.' } },
  ],
}
