import { APIError, type CollectionConfig } from 'payload'

import { isStaffUser, staffOrOwnUpload } from '@/access'
import { IMAGE_LICENCES } from '@/lib/constants'

/** Every photo is stored as WebP in a fixed 4:3 frame (cropped around the focal point). */
const webp = { format: 'webp' as const, options: { quality: 80 } }

export const MIN_IMAGE_WIDTH = 1200

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photos' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'credit', 'licence', 'updatedAt'],
    description: `Photos are cropped to a standard 4:3 frame around the focal point and converted to WebP. Minimum width ${MIN_IMAGE_WIDTH} px. Store credit and licence for every image.`,
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: staffOrOwnUpload,
    delete: ({ req }) => isStaffUser(req.user),
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    // Cap the stored original; all public renditions come from `imageSizes`.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    formatOptions: webp,
    imageSizes: [
      { name: 'thumb', width: 480, height: 360, formatOptions: webp },
      { name: 'card', width: 960, height: 720, formatOptions: webp },
      { name: 'large', width: 1440, height: 1080, withoutEnlargement: false, formatOptions: webp },
      { name: 'og', width: 1200, height: 630, withoutEnlargement: false, formatOptions: webp },
    ],
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (req.user && operation === 'create') data.uploadedBy = req.user.id
        if (req.file && typeof data.width === 'number' && data.width < MIN_IMAGE_WIDTH) {
          throw new APIError(
            `This photo is ${data.width} px wide. Please upload at least ${MIN_IMAGE_WIDTH} px so every listing looks sharp.`,
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Describe the photo, e.g. "Kia PV5 Cargo, side view, white".' },
    },
    {
      name: 'credit',
      type: 'text',
      required: true,
      admin: { description: 'Shown under the photo, e.g. "Photo: Kia Europe".' },
    },
    {
      name: 'licence',
      type: 'select',
      required: true,
      defaultValue: 'press-kit',
      options: IMAGE_LICENCES.map((value) => ({
        value,
        label: {
          'press-kit': 'Manufacturer press kit (editorial use)',
          'manufacturer-permission': 'Written permission from the manufacturer',
          own: 'Own photo',
          'cc-by': 'CC BY',
          'cc-by-sa': 'CC BY-SA',
          other: 'Other (see note)',
        }[value],
      })),
    },
    { name: 'sourceUrl', type: 'text', admin: { description: 'Where the photo comes from.' } },
    {
      name: 'view',
      type: 'select',
      options: [
        { value: 'side', label: 'Side view' },
        { value: 'front34', label: 'Front three-quarter' },
        { value: 'rear34', label: 'Rear three-quarter' },
        { value: 'interior', label: 'Cab / interior' },
        { value: 'cargo', label: 'Load area / body' },
        { value: 'action', label: 'In use' },
        { value: 'detail', label: 'Detail' },
      ],
    },
    { name: 'licenceNote', type: 'textarea', admin: { condition: (d) => d?.licence === 'other' } },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
