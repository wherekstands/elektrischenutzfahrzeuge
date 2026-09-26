/** Structured data. `<` is escaped so the JSON cannot close the script tag. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean)
  if (!items.length) return null
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
