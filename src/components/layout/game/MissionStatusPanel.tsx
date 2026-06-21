import type { ReactNode } from 'react'
import { useGameStore } from '../../../store/gameStore'
import { ActiveCityDisplay } from '../../Board/ActiveCityDisplay'
import { WasteTrack } from '../../Board/WasteTrack'
import { TimeTokens } from '../../Board/TimeTokens'
import { CrisisDisplay } from '../../Board/CrisisDisplay'
import { CityDeckDisplay } from '../../Board/CityDeckDisplay'
import { CargoStatusDisplay } from '../../Board/CargoStatusDisplay'

function StatusSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section className="mission-status-panel__section" aria-label={label}>
      <h3 className="mission-status-panel__label">{label}</h3>
      {children}
    </section>
  )
}

export function MissionStatusPanel() {
  const crisisEnabled = useGameStore((s) => s.settings.crisisEnabled)

  return (
    <div className="mission-status-panel mission-status-panel--instruments">
      <h2 className="panel-heading">Mission Status</h2>
      {crisisEnabled && (
        <p className="mission-status-panel__crisis-on">Crisis mode active</p>
      )}
      <ActiveCityDisplay />
      <StatusSection label="Tokens">
        <TimeTokens />
      </StatusSection>
      <StatusSection label="Waste">
        <WasteTrack compact />
      </StatusSection>
      <StatusSection label="Cargo">
        <CargoStatusDisplay />
      </StatusSection>
      <StatusSection label="City deck">
        <CityDeckDisplay />
      </StatusSection>
      <StatusSection label="Crisis">
        <CrisisDisplay />
      </StatusSection>
    </div>
  )
}
