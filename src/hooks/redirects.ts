import type { PayloadRequest } from 'payload'

/**
 * Record a permanent redirect when a public slug changes (docs/03 §1: slugs never change; if they must,
 * keep a redirect). Paths are locale-independent internal paths, e.g. `/vehicles/old-slug`.
 */
export const recordRedirect = async (req: PayloadRequest, from: string, to: string, reason: string) => {
  if (!from || !to || from === to) return
  const { payload } = req
  // Point older redirects that led to `from` straight at the new target (no chains).
  const chained = await payload.find({
    collection: 'redirects',
    where: { to: { equals: from } },
    limit: 100,
    depth: 0,
    req,
  })
  for (const r of chained.docs) {
    await payload.update({ collection: 'redirects', id: r.id, data: { to }, req, depth: 0 })
  }
  // Remove a redirect that would now loop.
  await payload.delete({ collection: 'redirects', where: { from: { equals: to } }, req })
  const existing = await payload.find({
    collection: 'redirects',
    where: { from: { equals: from } },
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.docs[0]) {
    await payload.update({ collection: 'redirects', id: existing.docs[0].id, data: { to, reason }, req })
  } else {
    await payload.create({ collection: 'redirects', data: { from, to, reason }, req })
  }
}
