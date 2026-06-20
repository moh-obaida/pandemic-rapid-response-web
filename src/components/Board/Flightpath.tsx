import { useGameStore } from '../../store/gameStore'
import { getFlightpathCities } from '../../lib/engine/selectors'
import { CityCard } from '../ds/CityCard'
import { dieImagePath, crisisImagePath } from '../../lib/assetManifest'

interface FlightpathProps {
  onCityClick?: (cityId: number) => void
}

export function Flightpath({ onCityClick }: FlightpathProps) {
  const snapshot = useGameStore((s) => s.snapshot)
  if (!snapshot) return null

  const cities = getFlightpathCities(snapshot).filter(
    (c) => c.faceUp || c.delivered || c.isPlaneHere
  )

  if (cities.length === 0) {
    return (
      <div className="flightpath-strip flightpath-strip--empty" aria-label="Flight path">
        <span className="flightpath-strip__placeholder">
          Cities appear when the timer reveals them
        </span>
      </div>
    )
  }

  return (
    <div className="flightpath-strip" aria-label="Flight path route">
      {cities.map((city) => {
        const blockers =
          snapshot.cities.find((c) => c.cityIndex === city.cityIndex)?.blockers ?? []
        const topBlocker = blockers[blockers.length - 1]
        return (
        <div key={city.cityIndex} className="flightpath-strip__item">
          {city.isPlaneHere && (
            <img
              src={dieImagePath('plane')}
              alt=""
              className="flightpath-strip__plane"
              aria-hidden
            />
          )}
          <div className="flightpath-strip__card-wrap">
            <CityCard
              city={city.name}
              cityId={city.cityIndex}
              current={city.isPlaneHere}
              delivered={city.delivered}
              compact
              onClick={
                city.faceUp && onCityClick
                  ? () => onCityClick(city.cityIndex)
                  : undefined
              }
            />
            {topBlocker && (
              <img
                src={crisisImagePath(topBlocker.definitionId)}
                alt=""
                className="flightpath-strip__blocker"
                aria-hidden
              />
            )}
          </div>
          <div className="flightpath-strip__label">{city.name}</div>
        </div>
        )
      })}
    </div>
  )
}
