import type { RoomId } from '../../../types/board'
import { BOARD_HOTSPOTS } from '../../../lib/boardHotspots'

interface RoomHotspotProps {
  roomId: RoomId
  label: string
  selected?: boolean
  activeTurn?: boolean
  validMove?: boolean
  validAssign?: boolean
  canActivate?: boolean
  deliveryReady?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function RoomHotspot({
  roomId,
  label,
  selected,
  activeTurn,
  validMove,
  validAssign,
  canActivate,
  deliveryReady,
  disabled,
  onClick,
}: RoomHotspotProps) {
  const spot = BOARD_HOTSPOTS.find((s) => s.roomId === roomId)
  if (!spot) return null

  return (
    <button
      type="button"
      className={[
        'board-hotspot',
        selected ? 'board-hotspot--selected' : '',
        activeTurn ? 'board-hotspot--active-turn' : '',
        validMove ? 'board-hotspot--valid-move' : '',
        validAssign ? 'board-hotspot--valid-assign' : '',
        canActivate ? 'board-hotspot--can-activate' : '',
        deliveryReady ? 'board-hotspot--delivery-ready' : '',
        disabled ? 'board-hotspot--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: `${spot.left}%`,
        top: `${spot.top}%`,
        width: `${spot.width}%`,
        height: `${spot.height}%`,
      }}
      aria-label={label}
      aria-pressed={selected ? true : undefined}
      data-room-id={roomId}
      data-testid={`board-hotspot-${roomId}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    />
  )
}
