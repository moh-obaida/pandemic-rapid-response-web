import { WasteTrack as DSWasteTrack } from '../ds/WasteTrack'
import { TOKEN_DISPLAY } from '../../lib/engine/selectors'
import { Tooltip } from '../layout/Tooltip'
import { useGameStore } from '../../store/gameStore'

interface WasteTrackProps {
  compact?: boolean
}

export function WasteTrack({ compact }: WasteTrackProps) {
  const waste = useGameStore((s) => s.snapshot?.waste ?? 0)

  if (compact) {
    return (
      <Tooltip content="Waste rises when circled dice appear after supply room activation">
        <div className="waste-track-compact" aria-label={`Waste ${waste} of ${TOKEN_DISPLAY.wasteMax}`}>
          <span className="waste-track-compact__icon" aria-hidden>♻</span>
          <div className="waste-track-compact__cells">
            {Array.from({ length: TOKEN_DISPLAY.wasteMax }, (_, i) => (
              <span
                key={i}
                className={[
                  'waste-track-compact__cell',
                  i < waste ? 'waste-track-compact__cell--filled' : '',
                  i === waste - 1 ? 'waste-track-compact__cell--current' : '',
                  i >= TOKEN_DISPLAY.wasteMax - 2 ? 'waste-track-compact__cell--skull' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden
              >
                {i >= TOKEN_DISPLAY.wasteMax - 2 ? '☠' : i + 1}
              </span>
            ))}
          </div>
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip content="Waste rises when circled dice appear after supply room activation">
      <DSWasteTrack value={waste} max={TOKEN_DISPLAY.wasteMax} />
    </Tooltip>
  )
}
