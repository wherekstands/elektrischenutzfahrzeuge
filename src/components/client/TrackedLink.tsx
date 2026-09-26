'use client'

import { track } from '@vercel/analytics'
import type { AnchorHTMLAttributes } from 'react'

/**
 * Outbound link that records a cookie-less analytics event (docs/03 §9): "Email contact" and
 * "Manufacturer page" clicks are the value proof for partners.
 */
export function TrackedLink({
  event,
  data,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; data?: Record<string, string> }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        try {
          track(event, data)
        } catch {
          // analytics must never break navigation
        }
        props.onClick?.(e)
      }}
    />
  )
}
