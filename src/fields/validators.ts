import type { TextFieldSingleValidation } from 'payload'

import { DEFAULT_LOCALE } from '../i18n/config'

/**
 * For localized labels inside arrays: required in the default language only. Payload's `required`
 * applies to every locale, so an editor could not save a German translation of a listing without
 * first translating every document title. Other languages fall back to the default text.
 */
export const requiredInDefaultLocale: TextFieldSingleValidation = (value, { req }) => {
  const locale = req?.locale ?? DEFAULT_LOCALE
  if (locale !== DEFAULT_LOCALE && locale !== 'all') return true
  return typeof value === 'string' && value.trim() ? true : 'This field is required (in English).'
}
