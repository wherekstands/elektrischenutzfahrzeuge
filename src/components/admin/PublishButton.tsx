'use client'

import { PublishButton as DefaultPublishButton, useAuth } from '@payloadcms/ui'
import React from 'react'

/**
 * Manufacturer partners cannot publish: they save drafts, which land in the review queue.
 * Staff get the normal publish button.
 */
export function PublishButton(props: React.ComponentProps<typeof DefaultPublishButton>) {
  const { user } = useAuth()
  if ((user as { role?: string } | null)?.role === 'partner') {
    return <span className="ecv-review-note">Saved drafts are reviewed and published by our editors.</span>
  }
  return <DefaultPublishButton {...props} />
}
