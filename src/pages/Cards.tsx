import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { MissionCtaBand } from '../components/layout/MissionCtaBand'
import { CITIES } from '../lib/constants/cities'
import { cityImagePathById } from '../lib/assetManifest'
import type { SupplyType } from '../types/board'

const SUPPLY_LABELS: Record<SupplyType, string> = {
  water: 'Water',
  food: 'Food',
  vaccine: 'Vaccine',
  power: 'Power',
  firstAid: 'First Aid',
}

function formatRequirements(crates: Partial<Record<SupplyType, number>>) {
  return Object.entries(crates)
    .map(([type, count]) => `${count}× ${SUPPLY_LABELS[type as SupplyType]}`)
    .join(' · ')
}

export function CardsPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="City Cards"
        description="All 24 cities on the PRR flightpath and their supply requirements."
        path="/cards"
      />
      <PageHeader
        eyebrow="Flightpath manifest"
        title="City Cards"
        subtitle="Cities appear as the mission timer runs — deliver the exact cargo mix to each."
      />
      <div className="mission-cards-grid">
        {CITIES.map((city) => (
          <figure key={city.cityId} className="mission-card-thumb">
            <img
              src={cityImagePathById(city.cityId)}
              alt={city.name}
              className="mission-card-thumb__img"
              loading="lazy"
            />
            <figcaption className="mission-card-thumb__name">{city.name}</figcaption>
            <p className="mission-card-thumb__req">{formatRequirements(city.crates)}</p>
          </figure>
        ))}
      </div>
      <MissionCtaBand />
    </SiteLayout>
  )
}
