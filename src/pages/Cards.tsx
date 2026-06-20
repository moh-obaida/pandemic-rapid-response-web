import { SiteLayout } from '../components/layout/SiteLayout'
import { SeoHead } from '../components/layout/SeoHead'
import { PageHeader } from '../components/layout/PageHeader'
import { CITIES } from '../lib/constants/cities'
import { cityImagePathById } from '../lib/assetManifest'

export function CardsPage() {
  return (
    <SiteLayout>
      <SeoHead
        title="City Cards"
        description="All 24 cities on the PRR flightpath and their supply requirements."
        path="/cards"
      />
      <PageHeader
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
          </figure>
        ))}
      </div>
    </SiteLayout>
  )
}
