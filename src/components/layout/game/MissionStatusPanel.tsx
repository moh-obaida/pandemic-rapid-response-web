import { WasteTrack } from '../../Board/WasteTrack'
import { TurnTimer } from '../../Board/TurnTimer'
import { TimeTokens } from '../../Board/TimeTokens'
import { CrisisDisplay } from '../../Board/CrisisDisplay'

export function MissionStatusPanel() {
  return (
    <div className="mission-status-panel">
      <section className="mission-status-panel__section" aria-label="Waste track">
        <WasteTrack />
      </section>
      <section className="mission-status-panel__section" aria-label="Round timer">
        <TurnTimer />
      </section>
      <section className="mission-status-panel__section" aria-label="Time tokens">
        <TimeTokens />
      </section>
      <section className="mission-status-panel__section" aria-label="Crisis">
        <CrisisDisplay />
      </section>
    </div>
  )
}
