import { Flightpath } from './Flightpath'

interface RouteMonitorProps {
  onCityClick?: (cityId: number) => void
}

/** Thin route strip below the board — aircraft route monitor. */
export function RouteMonitor({ onCityClick }: RouteMonitorProps) {
  return (
    <div className="route-monitor" aria-label="Flight route monitor">
      <span className="route-monitor__label">Route</span>
      <Flightpath onCityClick={onCityClick} />
    </div>
  )
}
