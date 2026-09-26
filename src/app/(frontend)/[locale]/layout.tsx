import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { CompareTray } from '@/components/client/CompareTray'
import { themeScript } from '@/components/client/ThemeToggle'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { isPublicLocale, OG_LOCALE, PUBLIC_LOCALES, type Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'
import { SITE_NAME, SITE_URL } from '@/lib/env'

import '../globals.css'

const display = localFont({
  src: '../../../assets/fonts/BricolageGrotesque-Variable-latin.woff2',
  weight: '200 800',
  variable: '--font-bricolage',
  display: 'swap',
})
const sans = localFont({
  src: '../../../assets/fonts/Geist-Variable.woff2',
  weight: '100 900',
  variable: '--font-geist',
  display: 'swap',
})
const mono = localFont({
  src: '../../../assets/fonts/GeistMono-Variable.woff2',
  weight: '100 900',
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
})

export function generateStaticParams() {
  return PUBLIC_LOCALES.map((locale) => ({ locale }))
}
// No `dynamicParams = false`: unknown locales already 404 below, and with it Next.js cannot regenerate
// pages after `revalidateTag(…, { expire: 0 })` (NoFallbackError → every page 404s after a publish).

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f16' },
  ],
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: t('description'),
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, locale: OG_LOCALE[locale as Locale] ?? 'en_GB', type: 'website' },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
    },
  }
}

/** Client components only get the namespaces they use (keeps the JS payload small). */
const CLIENT_NAMESPACES = ['nav', 'search', 'card', 'compare', 'saved', 'filters', 'results', 'sort', 'labels', 'correction', 'vehicle']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isPublicLocale(locale)) notFound()
  setRequestLocale(locale)
  const [catalog, messages] = await Promise.all([getCatalog(locale), getMessages()])
  const clientMessages = Object.fromEntries(Object.entries(messages).filter(([k]) => CLIENT_NAMESPACES.includes(k)))

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <SiteHeader catalog={catalog} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter catalog={catalog} />
          <CompareTray />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
