import { Flightpath } from '../../Board/Flightpath'

interface FlightPathDockProps {
  onDeliver: (cityId: number) => void
}

export function FlightPathDock({ onDeliver }: FlightPathDockProps) {
  return (
    <div className="flightpath-dock">
      <Flightpath onDeliver={onDeliver} />
    </div>
  )
}
