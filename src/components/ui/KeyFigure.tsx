import { cn } from '@/lib/cn'

/** Key figure tile: label on top, big tabular number with a small unit. Same height with or without value. */
export function KeyFigure({
  label,
  value,
  unit,
  missingLabel,
  size = 'md',
  className,
}: {
  label: string
  value: string | null
  unit?: string
  missingLabel: string
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div className={cn('rounded-box bg-surface-2 px-3 py-2.5', className)}>
      <dt className="truncate text-[12.5px] text-muted">{label}</dt>
      <dd className={cn('num mt-0.5 truncate', size === 'md' ? 'text-[19px]' : 'text-[15.5px]', !value && 'text-[14px] text-faint')}>
        {value ?? missingLabel}
        {value && unit ? <span className="unit">{unit}</span> : null}
      </dd>
    </div>
  )
}
