import { crateImagePath } from '../../../lib/assetManifest'
import type { SupplyType } from '../../../types/board'
import type { RoomId } from '../../../types/board'
import { BOARD_HOTSPOTS } from '../../../lib/boardHotspots'

interface CrateOverlayProps {
  crateId: string
  type: SupplyType
  location: RoomId | 'cargo'
  size?: number
  index?: number
}

export function CrateOverlay({
  crateId,
  type,
  location,
  size = 18,
  index = 0,
}: CrateOverlayProps) {
  const spot = BOARD_HOTSPOTS.find((s) => s.roomId === location)
  if (!spot && location !== 'cargo') return null

  const centerX = spot ? spot.left + spot.width / 2 : 50
  const centerY = spot ? spot.top + spot.height / 2 + 4 : 82
  const offset = (index % 4) * 5 - 7.5

  return (
    <img
      key={crateId}
      src={crateImagePath(type)}
      alt=""
      className="board-overlay__crate-img"
      data-crate-id={crateId}
      data-location={location}
      width={size}
      height={size}
      style={{
        left: `${centerX + offset}%`,
        top: `${centerY}%`,
      }}
      draggable={false}
    />
  )
}
