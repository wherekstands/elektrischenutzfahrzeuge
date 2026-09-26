import { setRequestLocale } from 'next-intl/server'

import { VehicleCard } from '@/components/vehicle/VehicleCard'
import type { Locale } from '@/i18n/config'
import { getCatalog } from '@/lib/catalog'

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const catalog = await getCatalog(locale as Locale)
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">{catalog.listings.length} listings</h1>
      <div className="results-grid mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.listings.slice(0, 6).map((l) => (
          <VehicleCard key={l.id} listing={l} catalog={catalog} />
        ))}
      </div>
    </div>
  )
}
