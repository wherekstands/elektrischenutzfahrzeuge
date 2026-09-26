import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

/**
 * Draft preview for editors and partners (admin "Preview" button). Requires a logged-in Payload user;
 * enables Next.js draft mode and redirects to the page, which then renders unpublished changes.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Please log in to the admin first.', { status: 401 })
  ;(await draftMode()).enable()
  redirect(path)
}
