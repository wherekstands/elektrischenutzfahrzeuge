'use client'

import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useActionState, useState } from 'react'

import { submitCorrection, type CorrectionState } from '@/app/(frontend)/[locale]/vehicles/[slug]/suggest-correction/actions'

type FieldOption = { value: string; label: string; current: string }

/** Works without JavaScript (server action form post); with JS it stays on the page. */
export function CorrectionForm({
  slug,
  locale,
  fields,
  backHref,
  privacyHref,
}: {
  slug: string
  locale: string
  fields: FieldOption[]
  backHref: string
  privacyHref: string
}) {
  const t = useTranslations('correction')
  const [state, action, pending] = useActionState<CorrectionState, FormData>(submitCorrection, { status: 'idle' })
  const [rows, setRows] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [started] = useState(() => Date.now())

  if (state.status === 'ok') {
    return (
      <div className="rounded-card border border-good/30 bg-good-soft p-8 text-center" role="status">
        <CheckCircle2 size={36} className="mx-auto text-good" aria-hidden />
        <p className="mt-3 text-[20px] font-bold">{t('thanks')}</p>
        <p className="mt-1 text-ink-2">{t('thanksLead')}</p>
        <a href={backHref} className="btn btn-secondary mt-5">
          {t('backToListing')}
        </a>
      </div>
    )
  }

  const label = 'mb-1.5 block text-[13.5px] font-semibold'
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="started" value={started} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className={label}>{t('field')}</legend>
        {Array.from({ length: rows }, (_, i) => {
          const current = fields.find((f) => f.value === selected[i])?.current
          return (
            <div key={i} className="grid gap-2 rounded-box border border-line bg-surface-2 p-3 sm:grid-cols-[1fr_1fr]">
              <select
                name={`field_${i}`}
                className="input"
                defaultValue=""
                aria-label={t('field')}
                onChange={(e) => setSelected((s) => Object.assign([...s], { [i]: e.target.value }))}
              >
                <option value="">{t('fieldPlaceholder')}</option>
                {fields.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
                <option value="other">{t('otherField')}</option>
              </select>
              <input name={`proposed_${i}`} className="input" placeholder={t('proposed')} aria-label={t('proposed')} maxLength={300} />
              {current !== undefined && (
                <p className="text-[12.5px] text-muted sm:col-span-2">
                  {t('current')}: <span className="num text-ink-2">{current || '—'}</span>
                </p>
              )}
            </div>
          )
        })}
        {rows < 5 && (
          <button type="button" onClick={() => setRows((r) => r + 1)} className="link text-[13.5px]">
            + {t('addRow')}
          </button>
        )}
      </fieldset>

      <div>
        <label htmlFor="message" className={label}>
          {t('message')}
        </label>
        <textarea id="message" name="message" rows={4} maxLength={4000} placeholder={t('messagePlaceholder')} className="input h-auto py-2.5" />
      </div>
      <div>
        <label htmlFor="source" className={label}>
          {t('source')}
        </label>
        <input id="source" name="source" type="url" inputMode="url" placeholder="https://" className="input" />
        <p className="mt-1 text-[12.5px] text-muted">{t('sourceHint')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            {t('name')}
          </label>
          <input id="name" name="name" autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            {t('email')}
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="input" />
          <p className="mt-1 text-[12.5px] text-muted">{t('emailHint')}</p>
        </div>
        <div>
          <label htmlFor="company" className={label}>
            {t('company')}
          </label>
          <input id="company" name="company" autoComplete="organization" className="input" />
        </div>
        <div>
          <label htmlFor="relation" className={label}>
            {t('relation')}
          </label>
          <select id="relation" name="relation" className="input" defaultValue="buyer">
            {(['buyer', 'manufacturer', 'dealer', 'press', 'other'] as const).map((r) => (
              <option key={r} value={r}>
                {t(`relations.${r}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="rounded-box bg-bad-soft px-4 py-3 text-[14px] text-bad">
          {state.message === 'tooShort' ? t('tooShort') : t('error')}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? t('sending') : t('submit')}
        </button>
        <a href={privacyHref} className="text-[12.5px] text-muted hover:underline">
          {t('privacy')}
        </a>
      </div>
    </form>
  )
}
