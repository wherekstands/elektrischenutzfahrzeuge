import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'

import { isPartnerUser, isStaffUser, staffFieldOnly, staffOrOwnBrand } from '@/access'
import { seoFields } from '@/fields/seo'
import { slugify, validateSlug } from '@/fields/slug'
import { partnerDraftsOnly } from '@/hooks/partnerGuard'
import { queuePartnerDraft } from '@/hooks/partnerReview'
import { recordRedirect } from '@/hooks/redirects'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { DOCUMENT_KINDS, HIGHLIGHT_MAX_CHARS, STATUSES } from '@/lib/constants'
import { pingIndexNow } from '@/lib/indexnow'
import { normalizeSpecValues, type SpecRule } from '@/lib/specs/normalize'

const idOf = (v: unknown): number | string | null =>
  v == null ? null : typeof v === 'object' ? ((v as { id: number | string }).id ?? null) : (v as number | string)

async function loadSpecRules(req: PayloadRequest): Promise<Map<string, SpecRule>> {
  const { docs } = await req.payload.find({
    collection: 'specs',
    limit: 0,
    pagination: false,
    depth: 0,
    locale: 'en',
    req,
  })
  return new Map(
    docs.map((d) => [
      d.key,
      {
        key: d.key,
        label: d.label,
        dataType: d.dataType,
        options: d.options?.map((o) => ({ value: o.value })) ?? null,
        min: d.min ?? null,
        max: d.max ?? null,
      },
    ]),
  )
}

const highlightLine = {
  name: 'text',
  type: 'text' as const,
  required: true,
  maxLength: HIGHLIGHT_MAX_CHARS,
}

export const Listings: CollectionConfig = {
  slug: 'listings',
  labels: { singular: 'Listing', plural: 'Listings' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'title',
    defaultColumns: ['title', 'vehicleType', 'availability', '_status', 'verifiedAt', 'updatedAt'],
    listSearchableFields: ['title', 'model', 'family', 'slug'],
    pagination: { defaultLimit: 50 },
    description:
      'One listing per model version (e.g. each battery size). Versions of the same model share a "Model family".',
    preview: (doc, { locale }) =>
      doc?.slug ? `/next/preview?path=${encodeURIComponent(`/${locale || 'en'}/vehicles/${doc.slug}`)}` : null,
    components: {
      edit: {
        PublishButton: '/components/admin/PublishButton#PublishButton',
      },
    },
  },
  versions: { drafts: true, maxPerDoc: 50 },
  access: {
    read: staffOrOwnBrand('brand'),
    create: ({ req }) => isStaffUser(req.user) || isPartnerUser(req.user),
    update: staffOrOwnBrand('brand'),
    delete: ({ req }) => isStaffUser(req.user),
  },
  hooks: {
    beforeOperation: [partnerDraftsOnly('brand')],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // Title = "<Brand> <Model>" for the admin and as slug source.
        const brandId = idOf(data.brand ?? originalDoc?.brand)
        const model = (data.model ?? originalDoc?.model ?? '').trim()
        if (brandId != null && model) {
          const brand = await req.payload.findByID({
            collection: 'brands',
            id: brandId,
            depth: 0,
            draft: false,
            req,
            overrideAccess: true,
          })
          data.title = `${brand?.name ?? ''} ${model}`.trim()
        }
        if (!data.slug && !originalDoc?.slug && data.title) data.slug = slugify(data.title)

        // Validate spec values against the spec definitions.
        if (data.specs !== undefined) {
          const rules = await loadSpecRules(req)
          const { values, errors } = normalizeSpecValues(data.specs, rules)
          if (errors.length && data._status === 'published') {
            throw new APIError(`Please fix the specifications: ${errors.join(' ')}`, 400, undefined, true)
          }
          data.specs = values
        }

        // Keep at most three highlights of each kind.
        if (Array.isArray(data.keyFacts)) data.keyFacts = data.keyFacts.slice(0, 3)
        if (Array.isArray(data.keyBenefits)) data.keyBenefits = data.keyBenefits.slice(0, 3)
        return data
      },
    ],
    afterChange: [
      revalidateAfterChange,
      async ({ doc, previousDoc, req }) => {
        const published = doc._status === 'published'
        if (published && previousDoc?.slug && previousDoc.slug !== doc.slug && previousDoc._status === 'published') {
          await recordRedirect(req, `/vehicles/${previousDoc.slug}`, `/vehicles/${doc.slug}`, 'Listing slug changed')
        }
        if (published) void pingIndexNow([`/en/vehicles/${doc.slug}`])
        return doc
      },
      queuePartnerDraft('listing'),
    ],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { hidden: true },
      index: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Vehicle',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                  required: true,
                  index: true,
                  access: { update: staffFieldOnly },
                  admin: { width: '34%' },
                },
                {
                  name: 'model',
                  type: 'text',
                  required: true,
                  admin: { width: '33%', description: 'Model and version without brand, e.g. "PV5 Cargo Long Range".' },
                },
                {
                  name: 'family',
                  label: 'Model family',
                  type: 'text',
                  admin: {
                    width: '33%',
                    description: 'Same for all versions of a model, e.g. "PV5 Cargo". Links versions together.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'vehicleType',
                  type: 'relationship',
                  relationTo: 'vehicle-types',
                  required: true,
                  index: true,
                  filterOptions: { parent: { exists: true } },
                  admin: {
                    width: '50%',
                    description: 'Exactly one type. It decides which specs and key figures the listing shows.',
                  },
                },
                {
                  name: 'availability',
                  label: 'Availability',
                  type: 'select',
                  required: true,
                  defaultValue: 'on-sale',
                  options: STATUSES.map((value) => ({
                    value,
                    label: {
                      'on-sale': 'On sale',
                      'orders-open': 'Order books open',
                      announced: 'Announced',
                      discontinued: 'Discontinued',
                    }[value],
                  })),
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'jobs',
              type: 'relationship',
              relationTo: 'jobs',
              hasMany: true,
              filterOptions: { parent: { exists: true } },
              admin: { description: 'What it is used for. Tick all that apply; they link to job pages.' },
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              localized: true,
              maxLength: 240,
              admin: { description: 'One or two factual sentences for cards, search and the listing intro.' },
            },
          ],
        },
        {
          label: 'Specifications',
          description:
            'Only fill values you can source. Empty values show as "Not published". The fields shown depend on the vehicle type.',
          fields: [
            {
              name: 'specs',
              type: 'json',
              defaultValue: {},
              admin: {
                components: { Field: '/components/admin/SpecValuesField#SpecValuesField' },
              },
            },
          ],
        },
        {
          label: 'Highlights',
          description:
            'Shown high up on every listing. Key facts: factual and checkable, written by us. Benefits: the manufacturer’s own words, shown only while the brand has an active Pro partnership.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'keyFacts',
                  type: 'array',
                  localized: true,
                  maxRows: 3,
                  labels: { singular: 'Key fact', plural: 'Key facts' },
                  admin: { width: '50%', description: `3 lines, max ${HIGHLIGHT_MAX_CHARS} characters each.` },
                  fields: [highlightLine],
                },
                {
                  name: 'keyBenefits',
                  type: 'array',
                  localized: true,
                  maxRows: 3,
                  labels: { singular: 'Benefit', plural: 'Benefits' },
                  admin: {
                    width: '50%',
                    description: `Pro partners only. 3 lines, max ${HIGHLIGHT_MAX_CHARS} characters each.`,
                  },
                  fields: [highlightLine],
                },
              ],
            },
          ],
        },
        {
          label: 'Photos & documents',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              maxRows: 12,
              admin: {
                description:
                  'The first photo is the cover. Photos are cropped to 4:3 around their focal point, so every listing looks the same.',
              },
            },
            {
              name: 'documents',
              type: 'array',
              maxRows: 10,
              admin: {
                description: 'Brochures, data sheets, price lists. Shown for Starter and Pro partners.',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, localized: true, admin: { width: '50%' } },
                    {
                      name: 'kind',
                      type: 'select',
                      required: true,
                      defaultValue: 'brochure',
                      options: DOCUMENT_KINDS.map((value) => ({
                        value,
                        label: value[0].toUpperCase() + value.slice(1),
                      })),
                      admin: { width: '25%' },
                    },
                    {
                      name: 'language',
                      type: 'select',
                      defaultValue: 'en',
                      options: ['en', 'de', 'fr', 'nl', 'it', 'es', 'pl', 'multi'].map((v) => ({
                        value: v,
                        label: v === 'multi' ? 'Multilingual' : v.toUpperCase(),
                      })),
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'file', type: 'upload', relationTo: 'documents', admin: { width: '50%' } },
                    {
                      name: 'url',
                      type: 'text',
                      admin: { width: '50%', description: 'Or link to the manufacturer’s file.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Sources',
          fields: [
            {
              name: 'sourceUrl',
              label: 'Manufacturer page',
              type: 'text',
              admin: { description: 'Official product page. Shown as "Manufacturer page" (plain link).' },
            },
            {
              name: 'sources',
              type: 'array',
              admin: { description: 'Further public sources used for the specs (press releases, data sheets).' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
            {
              name: 'verifiedAt',
              label: 'Data confirmed by manufacturer on',
              type: 'date',
              access: { update: staffFieldOnly, create: staffFieldOnly },
              admin: {
                date: { pickerAppearance: 'dayOnly' },
                description:
                  'Shows "Data confirmed by <brand>" for 12 months while the brand has an active paid partnership. It means the manufacturer reviewed the data on this date; it is not a quality seal.',
              },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              access: { read: staffFieldOnly, update: staffFieldOnly },
            },
          ],
        },
        { label: 'SEO', fields: [seoFields()] },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      validate: validateSlug,
      access: { update: staffFieldOnly },
      admin: {
        position: 'sidebar',
        description:
          'Same in all languages, e.g. "kia-pv5-cargo-long-range". Generated from brand + model. Changing it later creates a redirect.',
      },
    },
    {
      name: 'demo',
      type: 'checkbox',
      defaultValue: false,
      access: { update: staffFieldOnly, create: staffFieldOnly },
      admin: {
        position: 'sidebar',
        description: 'Contains fictional sample content (development only).',
      },
    },
  ],
}
