import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { faqsField } from '@/fields/faqs'
import { seoFields } from '@/fields/seo'
import { slugField } from '@/fields/slug'
import { recordRedirect } from '@/hooks/redirects'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/** Buyer guides (docs/03 §7): answer buyer questions and link to hubs and listings. */
export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: 'Guide', plural: 'Guides' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status', 'updatedAt'],
    preview: (doc, { locale }) =>
      doc?.slug ? `/next/preview?path=${encodeURIComponent(`/${locale || 'en'}/guides/${doc.slug}`)}` : null,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    afterChange: [
      revalidateAfterChange,
      async ({ doc, previousDoc, req }) => {
        if (doc._status === 'published' && previousDoc?.slug && previousDoc.slug !== doc.slug) {
          await recordRedirect(req, `/guides/${previousDoc.slug}`, `/guides/${doc.slug}`, 'Guide slug changed')
        }
        return doc
      },
    ],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField({ from: 'title', localized: true }),
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 300,
      admin: { description: 'Two sentences for the guide list and the meta description.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', required: true, localized: true },
    faqsField(),
    {
      type: 'collapsible',
      label: 'Related (internal links)',
      fields: [
        { name: 'relatedTypes', type: 'relationship', relationTo: 'vehicle-types', hasMany: true },
        { name: 'relatedJobs', type: 'relationship', relationTo: 'jobs', hasMany: true },
        { name: 'relatedListings', type: 'relationship', relationTo: 'listings', hasMany: true, maxRows: 12 },
      ],
    },
    {
      name: 'author',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'name', type: 'text', admin: { description: 'Empty = site owner from Settings.' } },
        { name: 'role', type: 'text', localized: true },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
      hooks: {
        beforeChange: [({ value, siblingData }) => value ?? (siblingData?._status === 'published' ? new Date().toISOString() : value)],
      },
    },
    seoFields(),
  ],
}
