import type { Field } from 'payload'

/** Visible FAQs on hubs and guides (3–5 recommended, docs/03 §7). Also emitted as FAQPage JSON-LD. */
export const faqsField = (): Field => ({
  name: 'faqs',
  label: 'FAQs',
  type: 'array',
  localized: true,
  maxRows: 8,
  admin: {
    description: 'Shown on the page and marked up as FAQPage. Aim for 3–5 real buyer questions.',
    initCollapsed: true,
  },
  fields: [
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'textarea', required: true },
  ],
})
