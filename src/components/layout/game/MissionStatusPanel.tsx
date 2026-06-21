import type { ReactNode } from 'react'
import { useGameStore } from '../../../store/gameStore'
import { WasteTrack } from '../../Board/WasteTrack'
import { TimeTokens } from '../../Board/TimeTokens'
import { CrisisDisplay } from '../../Board/CrisisDisplay'
import { CityDeckDisplay } from '../../Board/CityDeckDisplay'
import { CargoStatusDisplay } from '../../Board/CargoStatusDisplay'
import { assetManifest } from '../../../lib/assetManifest'

function InstrumentSection({
  label,
  bg,
  children,
}: {
  label: string
  bg?: string
  children: ReactNode
}) {
  return (
    <section className="mission-status-panel__section instrument-panel" aria-label={label}>
      {bg && <img src={bg} alt="" className="instrument-panel__bg" draggable={false} />}
      <div className="instrument-panel__content">{children}</div>
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
      <InstrumentSection label="HQ and supply tokens" bg={assetManifest.board.controlPanel}>
        <TimeTokens />
      </InstrumentSection>
      <InstrumentSection label="Waste track" bg={assetManifest.board.radar}>
        <WasteTrack compact />
      </InstrumentSection>
      <InstrumentSection label="Cargo bay">
        <CargoStatusDisplay />
      </InstrumentSection>
      <InstrumentSection label="City deck">
        <CityDeckDisplay />
      </InstrumentSection>
      <InstrumentSection label="Crisis">
        <CrisisDisplay />
      </InstrumentSection>
    </div>
  )
}
