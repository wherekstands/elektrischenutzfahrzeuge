import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import type { Locale } from '@/i18n/config'
import { cn } from '@/lib/cn'
import { localizeInternalHref } from '@/lib/urls'

/** Renders CMS rich text. Internal "/en/…" links are rewritten to the current locale. */
export function RichText({
  value,
  locale,
  className,
}: {
  value: unknown
  locale: Locale
  className?: string
}) {
  if (!value || typeof value !== 'object' || !('root' in (value as object))) return null
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    link: (args) => {
      const node = args.node as { fields?: { url?: string; newTab?: boolean } }
      const url = node.fields?.url ?? '#'
      const localized = localizeInternalHref(url, locale)
      const external = /^https?:\/\//.test(localized)
      const children = args.nodesToJSX({ nodes: (args.node as unknown as { children: never[] }).children })
      return (
        <a href={localized} {...(external ? { rel: 'noopener', target: node.fields?.newTab ? '_blank' : undefined } : {})}>
          {children}
        </a>
      )
    },
  })
  return (
    <LexicalRichText
      data={value as SerializedEditorState}
      converters={converters}
      className={cn('prose-ecv', className)}
      disableContainer={false}
    />
  )
}
