import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { faqsField } from '@/fields/faqs'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { ILLUSTRATIONS, KEY_FIGURE_COUNT } from '@/lib/constants'

/**
 * Vehicle types: two levels. Level 1 = group (navigation shelf, e.g. "Municipal vehicles"),
 * level 2 = type (what buyers compare, e.g. "Street sweepers"). Listings always belong to one level-2 type.
 * The type decides the spec profile (which rows exist) and the four key figures. See docs/taxonomy.md.
 */
export const VehicleTypes: CollectionConfig = {
  slug: 'vehicle-types',
  labels: { singular: 'Vehicle type', plural: 'Vehicle types' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Taxonomy',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug', 'order', 'updatedAt'],
    listSearchableFields: ['name', 'slug', 'synonyms'],
    description:
      'Two levels: groups (no parent) and types (with a parent group). Listings attach to types. A type inherits the spec profile and key figures of its group and can add its own.',
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
      relationTo: 'vehicle-types',
      filterOptions: ({ id }) => ({ and: [{ parent: { exists: false } }, { id: { not_equals: id } }] }),
      admin: {
        position: 'sidebar',
        description: 'Empty = this is a group (level 1). Set a group to make this a type (level 2).',
      },
      validate: async (value: unknown, { req, id }: { req: import('payload').PayloadRequest; id?: string | number }) => {
        if (!value) return true
        const parentId = typeof value === 'object' ? (value as { id: number }).id : value
        if (parentId === id) return 'A type cannot be its own parent.'
        const parent = await req.payload.findByID({
          collection: 'vehicle-types',
          id: parentId as number,
          depth: 0,
          req,
        })
        if (parent?.parent) return 'Only two levels: pick a group (a type without parent).'
        if (id) {
          const children = await req.payload.count({
            collection: 'vehicle-types',
            where: { parent: { equals: id } },
            req,
          })
          if (children.totalDocs > 0) return 'This group has types. Move them first.'
        }
        return true
      },
    },
    {
      name: 'alsoListedIn',
      type: 'relationship',
      relationTo: 'vehicle-types',
      hasMany: true,
      filterOptions: ({ id }) => ({ and: [{ parent: { exists: false } }, { id: { not_equals: id } }] }),
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.parent),
        description:
          'Cross-listing: also show this type under other groups (e.g. refuse trucks under Municipal and Trucks). The breadcrumb keeps the main group.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers come first.' },
    },
    {
      name: 'illustration',
      type: 'select',
      options: ILLUSTRATIONS.map((value) => ({ value, label: value })),
      admin: {
        position: 'sidebar',
        description: 'Drawing used when a listing has no photo. Types inherit it from their group.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 200,
              admin: { description: 'One sentence, e.g. "Panel and crew vans up to 4.25 t".' },
            },
            {
              name: 'intro',
              type: 'richText',
              localized: true,
              admin: {
                description:
                  'Editorial intro for the hub page, 80–200 words: what defines this type, typical buyers, what to compare. Link to related hubs and guides.',
              },
            },
            faqsField(),
            {
              name: 'synonyms',
              type: 'textarea',
              localized: true,
              admin: {
                description:
                  'Comma-separated search terms and trade names, e.g. "RCV, bin lorry, garbage truck". Improves site search; never shown.',
              },
            },
          ],
        },
        {
          label: 'Specs & key figures',
          description:
            'Which specification rows every listing of this type shows. Universal specs (e.g. battery, charging, price) always apply. A type adds to its group’s profile.',
          fields: [
            {
              name: 'specs',
              label: 'Additional specs for this type or group',
              type: 'relationship',
              relationTo: 'specs',
              hasMany: true,
              filterOptions: { universal: { not_equals: true } },
            },
            {
              name: 'keyFigures',
              label: `Key figures (up to ${KEY_FIGURE_COUNT}, in order)`,
              type: 'relationship',
              relationTo: 'specs',
              hasMany: true,
              maxRows: KEY_FIGURE_COUNT,
              filterOptions: { dataType: { equals: 'number' } },
              admin: {
                description:
                  'Shown as tiles at the top of every listing; the first three also appear on result cards. Leave empty on a type to inherit from its group.',
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoFields()] },
      ],
    },
    {
      name: 'children',
      type: 'join',
      collection: 'vehicle-types',
      on: 'parent',
      admin: { defaultColumns: ['name', 'slug', 'order'] },
    },
    {
      name: 'listings',
      type: 'join',
      collection: 'listings',
      on: 'vehicleType',
      admin: { defaultColumns: ['title', 'availability', '_status'] },
    },
  ],
}
