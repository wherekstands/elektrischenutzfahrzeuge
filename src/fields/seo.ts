import type { Field } from 'payload'

/**
 * Optional overrides. Titles and descriptions are generated from real data by src/lib/seo/metadata.ts;
 * only fill these when the generated text is not good enough.
 */
export const seoFields = (): Field => ({
  name: 'seo',
  label: 'SEO overrides',
  type: 'group',
  admin: {
    description: 'Leave empty to use the generated title (≤ 60 characters) and description (≤ 155).',
  },
  fields: [
    { name: 'title', type: 'text', localized: true, maxLength: 70 },
    { name: 'description', type: 'textarea', localized: true, maxLength: 170 },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Force noindex, e.g. for pages that are not ready.' },
    },
  ],
})
