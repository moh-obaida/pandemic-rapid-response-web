import { Plane } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { CityCard } from '../ds/CityCard'

interface FlightpathProps {
  onDeliver?: (cityId: number) => void
}

export function Flightpath({ onDeliver }: FlightpathProps) {
  const cities = useGameStore((s) => s.board.cities)
  const planePosition = useGameStore((s) => s.board.planePosition)
  const supplies = useGameStore((s) => s.gameState.supplies)
  const phase = useGameStore((s) => s.gameState.phase)

  const cargoTypes = new Set(
    supplies.filter((s) => s.inCargo).map((s) => s.type)
  )

  return (
    <div className="relative w-full h-[120px]" aria-label="Flightpath with 24 cities">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M 20 100 Q 300 10, 600 30 T 1180 100"
          fill="none"
          stroke="var(--line)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>

      <div className="absolute inset-0 flex items-end justify-between px-2 pb-1">
        {cities.map((city, i) => {
          const angle = (i / (cities.length - 1)) * Math.PI
          const xPct = 2 + (i / (cities.length - 1)) * 96
          const yOffset = Math.sin(angle) * 60
          const canDeliver =
            phase === 'delivering' &&
            !city.delivered &&
            cargoTypes.has(city.supplyNeeded)

          return (
            <div
              key={city.id}
              className="absolute"
              style={{
                left: `${xPct}%`,
                bottom: `${12 + yOffset * 0.3}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {planePosition === city.id && (
                <Plane
                  size={14}
                  className="mx-auto mb-0.5"
                  style={{ color: 'var(--plane)' }}
                />
              )}
              <CityCard
                city={city.name}
                region={city.region}
                supplyNeeded={city.supplyNeeded}
                current={planePosition === city.id}
                delivered={city.delivered}
                compact
                onClick={canDeliver ? () => onDeliver?.(city.id) : undefined}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
