import { ChevronDown } from 'lucide-react'

import type { Faq } from '@/lib/catalog/types'

/** Visible FAQs (also marked up as FAQPage by the page). Uses <details> so it works without JavaScript. */
export function Faqs({ title, faqs }: { title: string; faqs: Faq[] }) {
  if (!faqs.length) return null
  return (
    <section aria-labelledby="faq-heading" className="mt-14">
      <h2 id="faq-heading" className="text-[22px] font-bold">
        {title}
      </h2>
      <div className="mt-4 divide-y divide-line rounded-card border border-line bg-surface">
        {faqs.map((f, i) => (
          <details key={i} className="group px-5 py-4" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              <h3 className="font-sans text-[15.5px] tracking-normal">{f.question}</h3>
              <ChevronDown size={18} className="shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-2 text-ink-2">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
