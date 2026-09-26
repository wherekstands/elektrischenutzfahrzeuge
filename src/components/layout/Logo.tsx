export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M18.5 5 9 18h6l-1.5 9L23 14h-6l1.5-9Z" fill="var(--accent-ink)" />
    </svg>
  )
}
