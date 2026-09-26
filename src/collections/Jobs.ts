import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { faqsField } from '@/fields/faqs'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { ILLUSTRATIONS } from '@/lib/constants'

/**
 * Jobs (applications): two levels. Level 1 = area (e.g. "Municipal & public services"),
 * level 2 = job (e.g. "Street cleaning"). Listings can have many jobs. Jobs answer "what do I need it for".
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job', plural: 'Jobs' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Taxonomy',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug', 'order'],
    listSearchableFields: ['name', 'slug', 'synonyms'],
    description:
      'Two levels: areas (no parent) and jobs (with a parent area). Listings attach to jobs, many per listing.',
  },
  defaultSort: 'order',
  access: { read: () => true, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    slugField({ from: 'name', localized: true }),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'jobs',
      filterOptions: ({ id }) => ({ and: [{ parent: { exists: false } }, { id: { not_equals: id } }] }),
      admin: { position: 'sidebar', description: 'Empty = this is an area (level 1).' },
      validate: async (value: unknown, { req, id }: { req: import('payload').PayloadRequest; id?: string | number }) => {
        if (!value) return true
        const parentId = typeof value === 'object' ? (value as { id: number }).id : value
        if (parentId === id) return 'A job cannot be its own parent.'
        const parent = await req.payload.findByID({ collection: 'jobs', id: parentId as number, depth: 0, req })
        if (parent?.parent) return 'Only two levels: pick an area.'
        return true
      },
    },
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    {
      name: 'illustration',
      type: 'select',
      options: ILLUSTRATIONS.map((value) => ({ value, label: value })),
      admin: { position: 'sidebar', description: 'Areas only: drawing for the area tile.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'shortDescription', type: 'textarea', localized: true, maxLength: 200 },
            {
              name: 'intro',
              type: 'richText',
              localized: true,
              admin: { description: 'Editorial intro for the hub, 80–200 words.' },
            },
            faqsField(),
            {
              name: 'typicalTypes',
              type: 'relationship',
              relationTo: 'vehicle-types',
              hasMany: true,
              admin: { description: 'Vehicle types typically used for this job. Used for related links.' },
            },
            {
              name: 'synonyms',
              type: 'textarea',
              localized: true,
              admin: { description: 'Comma-separated search terms, e.g. "refuse collection, bin collection".' },
            },
          ],
        },
        { label: 'SEO', fields: [seoFields()] },
      ],
    },
    { name: 'children', type: 'join', collection: 'jobs', on: 'parent' },
  ],
}
