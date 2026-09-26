import React from 'react'

const Bolt = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#2B59C3" />
    <path d="M18.5 5 9 18h6l-1.5 9L23 14h-6l1.5-9Z" fill="#fff" />
  </svg>
)

export const Icon = () => <Bolt size={26} />

export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <Bolt size={40} />
    <div style={{ lineHeight: 1.15 }}>
      <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em' }}>ECV Base</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>Electric commercial vehicles · Europe</div>
    </div>
  </div>
)
