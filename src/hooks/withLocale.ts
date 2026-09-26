import type { PayloadRequest } from 'payload'

/**
 * Run Local API calls in another locale *inside* a hook without changing the request's own locale.
 *
 * Payload's Local API overwrites `req.locale` when a call passes both `req` and `locale`. In a hook
 * that silently switches the rest of the operation to that locale: a German edit would then be
 * validated and saved into the English fields. Never pass `locale` together with `req` directly.
 */
export async function withLocale<T>(req: PayloadRequest, locale: string, fn: () => Promise<T>): Promise<T> {
  const { locale: ownLocale, fallbackLocale } = req
  try {
    return await fn()
  } finally {
    req.locale = ownLocale
    req.fallbackLocale = fallbackLocale
  }
}
