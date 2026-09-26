import { getTranslations } from 'next-intl/server'

import { VehicleImage } from '@/components/ui/VehicleImage'
import type { ImageRef } from '@/lib/catalog/types'
import type { Illustration } from '@/lib/constants'

/**
 * Photo gallery in the standard 4:3 frame. A CSS scroll-snap strip with anchor thumbnails: works
 * without JavaScript and keeps the same height for every listing (photo or illustration).
 */
export async function Gallery({ images, illustration, seed, title }: { images: ImageRef[]; illustration: Illustration | null; seed: string; title: string }) {
  const t = await getTranslations('vehicle')
  const tCard = await getTranslations('card')
  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <VehicleImage image={null} illustration={illustration} seed={seed} alt={title} illustrationLabel={tCard('noPhotos')} priority />
      </div>
    )
  }
  return (
    <div>
      <div className="flex snap-x snap-mandatory overflow-x-auto rounded-card border border-line bg-surface scrollbar-none" aria-label={t('photos')} tabIndex={0}>
        {images.map((img, i) => (
          <figure key={img.id} id={`photo-${i + 1}`} className="relative w-full shrink-0 snap-center">
            <VehicleImage image={img} illustration={illustration} seed={seed} alt={img.alt || title} sizes="(min-width: 1024px) 60vw, 100vw" priority={i === 0} />
            <figcaption className="absolute bottom-2.5 left-2.5 flex gap-2 text-[11.5px]">
              {images.length > 1 && (
                <span className="rounded-md bg-ink/70 px-2 py-0.5 text-bg">{t('photo', { index: i + 1, total: images.length })}</span>
              )}
              {img.credit && <span className="rounded-md bg-ink/70 px-2 py-0.5 text-bg">{t('photoCredit', { credit: img.credit })}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {images.length > 1 && (
        <nav aria-label={t('thumbnails')} className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <a key={img.id} href={`#photo-${i + 1}`} className="block w-24 shrink-0 overflow-hidden rounded-box border border-line hover:border-ink-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.sizes.thumb?.url ?? img.url} alt="" width={96} height={72} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
