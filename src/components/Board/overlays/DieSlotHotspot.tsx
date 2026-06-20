import { dieImagePath } from '../../../lib/assetManifest'
import type { DieFace } from '../../../lib/constants/dice'
import type { RoomId } from '../../../types/board'
import { DIE_SLOT_POSITIONS } from '../../../lib/boardOverlayMap'

interface DieSlotHotspotProps {
  roomId: RoomId
  slotIndex: number
  face?: DieFace
  filled?: boolean
  locked?: boolean
  validTarget?: boolean
  dieSelected?: boolean
  onClick?: () => void
}

export function DieSlotHotspot({
  roomId,
  slotIndex,
  face,
  filled,
  locked,
  validTarget,
  dieSelected,
  onClick,
}: DieSlotHotspotProps) {
  const pos = DIE_SLOT_POSITIONS[roomId]?.[slotIndex]
  if (!pos) return null

  return (
    <button
      type="button"
      className={[
        'board-die-slot',
        filled ? 'board-die-slot--filled' : '',
        onClick ? 'board-die-slot--interactive' : '',
        validTarget ? 'board-die-slot--valid' : '',
        dieSelected && !validTarget && !filled ? 'board-die-slot--dim' : '',
        locked ? 'board-die-slot--locked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
      aria-label={`${roomId} die slot ${slotIndex + 1}`}
      data-room-id={roomId}
      data-slot-index={slotIndex}
      onClick={onClick}
    >
      {face && (
        <img
          src={dieImagePath(face)}
          alt=""
          className="board-die-slot__img"
          draggable={false}
        />
      )}
      {locked && <span className="board-die-slot__lock" aria-hidden>🔒</span>}
    </button>
  )
}
