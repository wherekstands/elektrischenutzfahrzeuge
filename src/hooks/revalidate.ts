import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { CATALOG_TAG } from '@/lib/constants'

/**
 * Invalidate every page derived from the catalogue. All public pages read from one tagged snapshot
 * (src/lib/catalog/load.ts), so a single tag keeps things simple and correct at ~1,500 listings.
 *
 * `{ expire: 0 }`: the next request regenerates, so editors see a published change right away.
 * Outside Next.js (seed script, CLI) there is no cache to invalidate; set `context.skipRevalidate`.
 */
export const revalidateCatalog = async (req?: PayloadRequest, reason?: string) => {
  if (req?.context?.skipRevalidate) return
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(CATALOG_TAG, { expire: 0 })
    req?.payload.logger.debug(`Revalidated catalogue${reason ? ` (${reason})` : ''}`)
  } catch (err) {
    // Not running inside a Next.js request (e.g. CLI). Nothing to invalidate.
    req?.payload.logger.debug(`Skipped revalidation: ${(err as Error).message}`)
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req, collection }) => {
  // Draft saves do not change the public site (unless a published doc was just unpublished).
  const isDraftSave = doc?._status === 'draft' && previousDoc?._status !== 'published'
  if (!isDraftSave) await revalidateCatalog(req, collection.slug)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  await revalidateCatalog(req, `${collection.slug} deleted`)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req, global }) => {
  await revalidateCatalog(req, global.slug)
  return doc
}
