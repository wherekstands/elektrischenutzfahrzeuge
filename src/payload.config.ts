import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Brands } from './collections/Brands'
import { ChangeRequests } from './collections/ChangeRequests'
import { Documents } from './collections/Documents'
import { Guides } from './collections/Guides'
import { Jobs } from './collections/Jobs'
import { LandingPages } from './collections/LandingPages'
import { Listings } from './collections/Listings'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Placements } from './collections/Placements'
import { Redirects } from './collections/Redirects'
import { Specs } from './collections/Specs'
import { Users } from './collections/Users'
import { VehicleTypes } from './collections/VehicleTypes'
import { billingEndpoints } from './endpoints/billing'
import { Pricing } from './globals/Pricing'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ---------------------------------------------------------------------------------------------
// Database (Supabase Postgres, EU / Frankfurt). See docs/deployment.md.
// DATABASE_URL: runtime connection (Supabase transaction pooler, port 6543, for serverless).
// DATABASE_MIGRATE_URL: optional direct/session connection used by `payload migrate`.
// ---------------------------------------------------------------------------------------------
const isMigrating = process.env.PAYLOAD_MIGRATING === 'true'
const rawConnectionString =
  (isMigrating && process.env.DATABASE_MIGRATE_URL) || process.env.DATABASE_URL || ''

function poolSSL(connectionString: string) {
  const mode = process.env.DATABASE_SSL // 'verify' (with DATABASE_CA_CERT) | 'no-verify' | 'off'
  if (mode === 'off') return undefined
  if (process.env.DATABASE_CA_CERT) {
    return { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true }
  }
  if (mode === 'no-verify') return { rejectUnauthorized: false }
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return undefined
  return undefined
}

/** An explicit SSL config must not be overridden by `sslmode` in the URL (node-postgres merges it last). */
function withoutSslMode(connectionString: string) {
  if (!process.env.DATABASE_SSL && !process.env.DATABASE_CA_CERT) return connectionString
  try {
    const url = new URL(connectionString)
    url.searchParams.delete('sslmode')
    return url.toString()
  } catch {
    return connectionString
  }
}

// ---------------------------------------------------------------------------------------------
// File storage: Supabase Storage via its S3-compatible endpoint. Falls back to local disk in dev.
// ---------------------------------------------------------------------------------------------
const s3Enabled = Boolean(process.env.S3_BUCKET && process.env.S3_ENDPOINT)
const publicFileUrl = (process.env.S3_PUBLIC_URL || '').replace(/\/+$/, '')
const plugins: Plugin[] = [
  s3Storage({
    enabled: s3Enabled,
    // Same DB schema with and without S3 (keeps migrations identical across environments).
    alwaysInsertFields: true,
    bucket: process.env.S3_BUCKET || 'ecv-base',
    config: {
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'eu-central-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    },
    collections: {
      media: {
        prefix: 'media',
        // Public bucket: serve files straight from Supabase's CDN instead of through the app.
        ...(publicFileUrl
          ? {
              disablePayloadAccessControl: true as const,
              generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) =>
                `${publicFileUrl}/${prefix ? `${prefix}/` : ''}${filename}`,
            }
          : {}),
      },
      documents: {
        prefix: 'documents',
        ...(publicFileUrl
          ? {
              disablePayloadAccessControl: true as const,
              generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) =>
                `${publicFileUrl}/${prefix ? `${prefix}/` : ''}${filename}`,
            }
          : {}),
      },
    },
  }),
]

const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM || 'no-reply@elektrischenutzfahrzeuge.de',
      defaultFromName: process.env.NEXT_PUBLIC_SITE_NAME || 'ECV Base',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · ECV Base admin',
      robots: 'noindex, nofollow',
    },
    components: {
      graphics: {
        Logo: '/components/admin/Graphics#Logo',
        Icon: '/components/admin/Graphics#Icon',
      },
      beforeDashboard: ['/components/admin/DashboardIntro#DashboardIntro'],
    },
  },
  collections: [
    Listings,
    Brands,
    Media,
    Documents,
    VehicleTypes,
    Jobs,
    Specs,
    LandingPages,
    Guides,
    Pages,
    ChangeRequests,
    Placements,
    Users,
    Redirects,
  ],
  globals: [Settings, Pricing],
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
    ],
    defaultLocale: 'en',
    // Fallback helps editors in the admin. The public site asks for fallbackLocale: false and only
    // publishes a locale when its own content exists (docs/03 §8).
    fallback: true,
  },
  i18n: { supportedLanguages: { en, de }, fallbackLanguage: 'en' },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  endpoints: billingEndpoints,
  db: postgresAdapter({
    pool: {
      connectionString: withoutSslMode(rawConnectionString),
      ssl: poolSSL(rawConnectionString),
      max: Number(process.env.DATABASE_POOL_MAX || 5),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Local development syncs the schema automatically; shared databases use migrations only.
    push: process.env.PAYLOAD_DB_PUSH !== 'false' && process.env.NODE_ENV !== 'production',
  }),
  email,
  sharp,
  plugins,
  telemetry: false,
})
