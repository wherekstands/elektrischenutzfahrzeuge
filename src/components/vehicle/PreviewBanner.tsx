import { draftMode } from 'next/headers'
import { getTranslations } from 'next-intl/server'

export async function PreviewBanner({ path }: { path: string }) {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null
  const t = await getTranslations('vehicle')
  return (
    <div className="bg-amber text-amber-ink">
      <div className="container-page flex items-center justify-between gap-4 py-2 text-[13.5px] font-medium">
        <span>{t('previewBanner')}</span>
        <a href={`/next/exit-preview?path=${encodeURIComponent(path)}`} className="underline">
          {t('exitPreview')}
        </a>
      </div>
    </div>
  )
}
