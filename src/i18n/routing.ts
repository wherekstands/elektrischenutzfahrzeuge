import { defineRouting } from 'next-intl/routing'

import { ALL_LOCALES, DEFAULT_LOCALE } from './config'

/**
 * URL plan (docs/03 §1). Internal pathnames are the English ones; German paths are prepared so enabling
 * the locale needs no code change. Vehicle slugs are the same in every locale; type, job and guide slugs
 * are localized CMS fields.
 */
export const routing = defineRouting({
  locales: ALL_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // No Accept-Language or cookie based redirects: `/` goes to /en, deep URLs are never redirected.
  localeDetection: false,
  localeCookie: false,
  // hreflang is emitted in <head> by our metadata helpers, only for locales where the page exists.
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/vehicles': { en: '/vehicles', de: '/fahrzeuge' },
    '/vehicles/[slug]': { en: '/vehicles/[slug]', de: '/fahrzeuge/[slug]' },
    '/vehicles/[slug]/suggest-correction': {
      en: '/vehicles/[slug]/suggest-correction',
      de: '/fahrzeuge/[slug]/korrektur-vorschlagen',
    },
    '/types': { en: '/types', de: '/typen' },
    '/types/[...slug]': { en: '/types/[...slug]', de: '/typen/[...slug]' },
    '/jobs': { en: '/jobs', de: '/einsatz' },
    '/jobs/[...slug]': { en: '/jobs/[...slug]', de: '/einsatz/[...slug]' },
    '/brands': { en: '/brands', de: '/marken' },
    '/brands/[slug]': { en: '/brands/[slug]', de: '/marken/[slug]' },
    '/compare': { en: '/compare', de: '/vergleich' },
    '/saved': { en: '/saved', de: '/merkliste' },
    '/guides': { en: '/guides', de: '/ratgeber' },
    '/guides/[slug]': { en: '/guides/[slug]', de: '/ratgeber/[slug]' },
    '/about': { en: '/about', de: '/ueber-uns' },
    '/methodology': { en: '/methodology', de: '/methodik' },
    '/how-ranking-works': { en: '/how-ranking-works', de: '/so-funktioniert-das-ranking' },
    '/for-manufacturers': { en: '/for-manufacturers', de: '/fuer-hersteller' },
    '/legal/imprint': { en: '/legal/imprint', de: '/rechtliches/impressum' },
    '/legal/privacy': { en: '/legal/privacy', de: '/rechtliches/datenschutz' },
    '/data': { en: '/data', de: '/daten' },
  },
})

export type AppPathname = keyof typeof routing.pathnames
