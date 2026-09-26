import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import type { Locale } from '@/i18n/config'
import { TrustPageView, trustMetadata } from '@/views/trust'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return trustMetadata(locale as Locale, 'privacy')
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <TrustPageView locale={locale as Locale} pageKey="privacy" />
}
