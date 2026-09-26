import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { faqsField } from '@/fields/faqs'
import { seoFields } from '@/fields/seo'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

/** Fixed trust and legal pages. Their URLs are defined in src/i18n/routing.ts; content lives here. */
export const PAGE_KEYS = [
  'about',
  'methodology',
  'how-ranking-works',
  'for-manufacturers',
  'imprint',
  'privacy',
  'partner-terms',
  'data',
] as const
export type PageKey = (typeof PAGE_KEYS)[number]

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Trust & legal pages' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'key', 'updatedAt'],
    description: 'About, methodology, "How ranking works", for manufacturers, imprint, privacy and partner terms.',
  },
  access: { read: staffOnly, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      options: PAGE_KEYS.map((value) => ({ value, label: value })),
      admin: { position: 'sidebar', description: 'Which page this is. The URL is fixed per key.' },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'intro', type: 'textarea', localized: true, admin: { description: 'Lead paragraph under the title.' } },
    { name: 'content', type: 'richText', localized: true },
    faqsField(),
    seoFields(),
  ],
}
