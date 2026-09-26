import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { faqsField } from '@/fields/faqs'
import { seoFields } from '@/fields/seo'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

/**
 * Curated type × job pages, e.g. /en/types/trucks/for/waste-collection ("Electric trucks for waste
 * collection"). Only curated combinations get a page; they are indexable with ≥ 3 listings (docs/03 §1).
 */
export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  labels: { singular: 'Type × job page', plural: 'Type × job pages' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Content',
    useAsTitle: 'internalTitle',
    defaultColumns: ['internalTitle', 'vehicleType', 'job', '_status', 'updatedAt'],
    description:
      'Curated combinations of a vehicle type (group or type) and a job (area or job). URL: /types/<type>/for/<job>.',
  },
  versions: { drafts: true },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const typeId = idOf(data.vehicleType ?? originalDoc?.vehicleType)
        const jobId = idOf(data.job ?? originalDoc?.job)
        if (typeId && jobId) {
          // Sequential on purpose: queries inside one transaction share a connection.
          const type = await req.payload.findByID({ collection: 'vehicle-types', id: typeId, depth: 0, locale: 'en', req })
          const job = await req.payload.findByID({ collection: 'jobs', id: jobId, depth: 0, locale: 'en', req })
          data.internalTitle = `${type.name} × ${job.name}`
        }
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'internalTitle', type: 'text', admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        {
          name: 'vehicleType',
          type: 'relationship',
          relationTo: 'vehicle-types',
          required: true,
          admin: { width: '50%' },
        },
        { name: 'job', type: 'relationship', relationTo: 'jobs', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: { description: 'H1. Default: "Electric <type> for <job>".' },
    },
    {
      name: 'intro',
      type: 'richText',
      localized: true,
      admin: { description: '80–200 words: what matters for this job, which specs to compare.' },
    },
    faqsField(),
    seoFields(),
  ],
}
