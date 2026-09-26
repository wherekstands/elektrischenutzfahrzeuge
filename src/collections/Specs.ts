import type { CollectionConfig } from 'payload'

import { isPartnerUser, staffOnly } from '@/access'
import { SLUG_PATTERN } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { SPEC_DATA_TYPES, SPEC_GROUP_ADMIN_LABELS, SPEC_GROUPS } from '@/lib/constants'
import { requiredInDefaultLocale } from '@/fields/validators'

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/


/**
 * Spec definitions: every field a listing can carry. Choice specs (select / multiselect) are
 * taxonomies too: their options become filter checkboxes. Adding a spec here and assigning it to a
 * vehicle type is all it takes to show it on listings, in filters and in compare. No deploy needed.
 */
export const Specs: CollectionConfig = {
  slug: 'specs',
  labels: { singular: 'Spec', plural: 'Specs' },
  admin: {
    hidden: ({ user }) => isPartnerUser(user),
    group: 'Taxonomy',
    useAsTitle: 'label',
    defaultColumns: ['label', 'key', 'dataType', 'unit', 'group', 'universal', 'filterable', 'order'],
    listSearchableFields: ['label', 'key'],
    description:
      'Specification fields. The group decides the section on the listing page; the vehicle type decides whether the spec appears at all (unless universal).',
  },
  defaultSort: 'order',
  access: { read: () => true, create: staffOnly, update: staffOnly, delete: staffOnly },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, admin: { width: '50%' } },
        {
          name: 'shortLabel',
          type: 'text',
          localized: true,
          admin: { width: '50%', description: 'For cards, key figure tiles and sort options, e.g. "Range".' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          validate: (v: unknown) =>
            typeof v === 'string' && KEY_PATTERN.test(v) ? true : 'Lowercase, digits and underscores, e.g. "range_km".',
          admin: {
            width: '34%',
            description: 'Stable ID stored with every listing. Do not change once in use.',
          },
        },
        {
          name: 'urlKey',
          type: 'text',
          required: true,
          unique: true,
          validate: (v: unknown) =>
            typeof v === 'string' && SLUG_PATTERN.test(v) ? true : 'Lowercase with hyphens, e.g. "range".',
          admin: {
            width: '33%',
            description: 'Filter parameter in URLs: ?range_min=300. Keep short and stable.',
          },
        },
        {
          name: 'dataType',
          type: 'select',
          required: true,
          defaultValue: 'number',
          options: SPEC_DATA_TYPES.map((value) => ({
            value,
            label: {
              number: 'Number',
              select: 'Single choice',
              multiselect: 'Multiple choice',
              boolean: 'Yes / no',
              feature: 'Standard / optional / not available',
              text: 'Free text',
            }[value],
          })),
          admin: { width: '33%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'unit',
          type: 'text',
          admin: {
            width: '25%',
            condition: (d) => d?.dataType === 'number',
            description: 'Shown after the value: kWh, km, kW, kg, t, m, m³, h, km/h, dB(A), l, €',
          },
        },
        {
          name: 'unitCode',
          type: 'text',
          admin: {
            width: '25%',
            condition: (d) => d?.dataType === 'number',
            description: 'UN/CEFACT code for structured data (KWH, KMT, KWT, KGM, TNE, MTR, MTQ, HUR…).',
          },
        },
        {
          name: 'decimals',
          type: 'number',
          min: 0,
          max: 3,
          admin: {
            width: '25%',
            condition: (d) => d?.dataType === 'number',
            description: 'Max decimals shown. Empty = automatic.',
          },
        },
        {
          name: 'better',
          type: 'select',
          defaultValue: 'none',
          options: [
            { value: 'none', label: 'Neither' },
            { value: 'high', label: 'Higher is better' },
            { value: 'low', label: 'Lower is better' },
          ],
          admin: {
            width: '25%',
            description: 'Marks the best value in compare and enables sorting.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'min',
          type: 'number',
          admin: {
            width: '25%',
            condition: (d) => d?.dataType === 'number',
            description: 'Plausibility check: lowest accepted value.',
          },
        },
        {
          name: 'max',
          type: 'number',
          admin: {
            width: '25%',
            condition: (d) => d?.dataType === 'number',
            description: 'Highest accepted value.',
          },
        },
      ],
    },
    {
      name: 'help',
      type: 'textarea',
      localized: true,
      admin: { description: 'Explains the value, e.g. "WLTP for vans; manufacturer figure for trucks".' },
    },
    {
      name: 'options',
      type: 'array',
      admin: {
        condition: (d) => d?.dataType === 'select' || d?.dataType === 'multiselect',
        description: 'Choices. The value is stored with listings and used in URLs; keep it stable.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              validate: (v: unknown) =>
                typeof v === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(v) ? true : 'Letters, digits, hyphens.',
              admin: { width: '35%' },
            },
            { name: 'label', type: 'text', localized: true, validate: requiredInDefaultLocale, admin: { width: '65%' } },
          ],
        },
      ],
    },
    {
      name: 'quickFilter',
      type: 'group',
      admin: {
        condition: (d) => d?.dataType === 'number' || d?.dataType === 'boolean' || d?.dataType === 'feature',
        description: 'Optional one-tap filter chip above results, e.g. "Range 300 km+".',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: false, admin: { width: '20%' } },
            {
              name: 'min',
              type: 'number',
              admin: { width: '30%', condition: (_d, s) => Boolean(s?.enabled) },
            },
            {
              name: 'label',
              type: 'text',
              localized: true,
              admin: { width: '50%', condition: (_d, s) => Boolean(s?.enabled) },
            },
          ],
        },
      ],
    },
    // Sidebar: placement and behaviour
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'energy',
      options: SPEC_GROUPS.map((value) => ({ value, label: SPEC_GROUP_ADMIN_LABELS[value] })),
      admin: { position: 'sidebar', description: 'Section on the listing page.' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Order within its section.' },
    },
    {
      name: 'universal',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Applies to every vehicle type (e.g. battery, price).' },
    },
    {
      name: 'filterable',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Offer as a filter on hubs and search.' },
    },
    {
      name: 'showInCompare',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
