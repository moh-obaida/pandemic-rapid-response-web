import { Flightpath } from '../../Board/Flightpath'

interface FlightPathDockProps {
  onCityClick?: (cityId: number) => void
}

export function FlightPathDock({ onCityClick }: FlightPathDockProps) {
  return (
    <div className="flightpath-dock">
      <span className="flightpath-dock__label">Flight Path</span>
      <Flightpath onCityClick={onCityClick} />
    </div>
  )
}
