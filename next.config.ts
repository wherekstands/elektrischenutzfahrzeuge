import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const allowIndexing =
  process.env.VERCEL_ENV === 'production' ||
  process.env.SITE_ENV === 'production' ||
  process.env.ALLOW_INDEXING === 'true'

/** Public host of uploaded files (Supabase Storage), e.g. https://<ref>.supabase.co */
const storageHost = (() => {
  try {
    return process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL).hostname : null
  } catch {
    return null
  }
})()

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Listing photos are pre-cropped into standard sizes by Payload (see src/collections/Media.ts),
    // so we serve them directly with srcset instead of paying for on-the-fly optimisation.
    unoptimized: true,
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/**' }],
    remotePatterns: storageHost ? [{ protocol: 'https', hostname: storageHost }] : [],
  },
  // Fonts for generated Open Graph images are read from disk at runtime.
  outputFileTracingIncludes: {
    '/**/*': ['./src/assets/fonts/**/*'],
  },
  async redirects() {
    return [
      // docs/03 §1: `/` redirects (308) to the default locale. No Accept-Language sniffing.
      { source: '/', destination: '/en', permanent: true },
    ]
  },
  async headers() {
    const headers = [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
    if (!allowIndexing) {
      // Preview deployments and local builds must never be indexed (docs/03 §3).
      headers.push({ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] })
    }
    return headers
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
