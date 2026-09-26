import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs'

/** H1 + lead + data summary. The summary is generated from data, so every hub has unique, useful text. */
export function HubHeader({
  crumbs,
  title,
  lead,
  summary,
  children,
  headingId = 'hub-title',
}: {
  crumbs: Crumb[]
  title: string
  lead?: string | null
  summary?: string | null
  children?: ReactNode
  headingId?: string
}) {
  return (
    <header className="pb-6 pt-6 md:pt-8">
      <Breadcrumbs items={crumbs} />
      <h1 id={headingId} className="mt-4 text-[clamp(28px,4vw,40px)] font-extrabold">
        {title}
      </h1>
      {lead && <p className="mt-3 max-w-3xl text-[16.5px] text-ink-2">{lead}</p>}
      {summary && <p className="mt-2 max-w-3xl text-[14.5px] text-muted">{summary}</p>}
      {children}
    </header>
  )
}
