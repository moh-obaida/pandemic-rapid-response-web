import { dieImagePath } from '../../../lib/assetManifest'
import { FLIGHTPATH_TAB_POSITIONS } from '../../../lib/boardHotspots'
import type { DieFace } from '../../../lib/constants/dice'

const FLIP_FACES: DieFace[] = ['water', 'food', 'power', 'vaccine', 'firstAid']

interface EngineerFlipPickerProps {
  onFlip: (face: DieFace) => void
  disabled?: boolean
}

export function EngineerFlipPicker({ onFlip, disabled }: EngineerFlipPickerProps) {
  if (disabled) return null

  return (
    <div className="engineer-flip-picker" aria-label="Engineer flip options">
      <span className="engineer-flip-picker__label">Flip to</span>
      {FLIP_FACES.map((face) => (
        <button
          key={face}
          type="button"
          className="engineer-flip-picker__btn"
          onClick={() => onFlip(face)}
        >
          <img src={dieImagePath(face)} alt="" width={28} height={28} draggable={false} />
        </button>
      ))}
    </div>
  )
}

interface FlyArrowOverlayProps {
  planeCityId: number
  showLeft?: boolean
  showRight?: boolean
  onFlyLeft?: () => void
  onFlyRight?: () => void
  disabled?: boolean
}

export function FlyArrowOverlay({
  planeCityId,
  showLeft,
  showRight,
  onFlyLeft,
  onFlyRight,
  disabled,
}: FlyArrowOverlayProps) {
  const pos = FLIGHTPATH_TAB_POSITIONS[planeCityId]
  if (!pos || disabled) return null

  return (
    <>
      {showLeft && (
        <button
          type="button"
          className="board-fly-arrow board-fly-arrow--left"
          style={{ left: `${pos.left - 6}%`, top: `${pos.top}%` }}
          aria-label="Fly left"
          onClick={onFlyLeft}
        >
          ←
        </button>
      )}
      {showRight && (
        <button
          type="button"
          className="board-fly-arrow board-fly-arrow--right"
          style={{ left: `${pos.left + 6}%`, top: `${pos.top}%` }}
          aria-label="Fly right"
          onClick={onFlyRight}
        >
          →
        </button>
      )}
    </>
  )
}
