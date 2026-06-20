import type { RoomId } from '../../../types/board'
import { BOARD_HOTSPOTS } from '../../../lib/boardHotspots'

interface PawnOverlayProps {
  playerId: string
  roomId: RoomId
  label: string
  color: string
  isSelf?: boolean
  index?: number
  total?: number
}

export function PawnOverlay({
  playerId,
  roomId,
  label,
  color,
  isSelf,
  index = 0,
  total = 1,
}: PawnOverlayProps) {
  const spot = BOARD_HOTSPOTS.find((s) => s.roomId === roomId)
  if (!spot) return null

  const centerX = spot.left + spot.width / 2
  const centerY = spot.top + spot.height / 2
  const offsetX = (index - (total - 1) / 2) * 6

  return (
    <span
      className="board-overlay__pawn"
      data-player-id={playerId}
      data-room-id={roomId}
      style={{
        left: `${centerX + offsetX}%`,
        top: `${centerY - 6}%`,
        background: color,
        outline: isSelf ? '2px solid #fff' : undefined,
      }}
      title={label}
    >
      {label}
    </span>
  )
}
