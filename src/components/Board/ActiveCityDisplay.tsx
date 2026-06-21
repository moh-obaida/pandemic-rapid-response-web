import { CITIES } from '../../lib/constants/cities'
import { useGameStore } from '../../store/gameStore'
import { CityCard } from '../ds/CityCard'
import { crateImagePath } from '../../lib/assetManifest'
import type { SupplyType } from '../../types/board'

const SUPPLY_SHORT: Record<SupplyType, string> = {
  water: 'Water',
  food: 'Food',
  power: 'Power',
  vaccine: 'Vaccine',
  firstAid: 'First Aid',
}

/** Current delivery objective when the plane is at a face-up city on the route. */
export function ActiveCityDisplay() {
  const snapshot = useGameStore((s) => s.snapshot)
  if (!snapshot) return null

  const cityId = snapshot.planePosition
  const def = CITIES.find((c) => c.cityId === cityId)
  const state = snapshot.cities.find((c) => c.cityIndex === cityId)
  if (!def || !state || state.status !== 'faceUpOnPath') return null

  const shortName = def.name.split(',')[0]

  return (
    <section className="mission-active-city" aria-label={`Deliver ${def.name}`}>
      <p className="mission-active-city__heading">Deliver {shortName}</p>
      <div className="mission-active-city__card">
        <CityCard city={def.name} cityId={cityId} current />
      </div>
      <ul className="mission-active-city__req">
        {(Object.entries(def.crates) as [SupplyType, number][]).map(([type, need]) => (
          <li key={type}>
            <img src={crateImagePath(type)} alt="" width={18} height={18} draggable={false} />
            <span>
              {need} {SUPPLY_SHORT[type]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
