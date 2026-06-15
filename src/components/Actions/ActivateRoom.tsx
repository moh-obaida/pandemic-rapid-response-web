import { ROOMS } from '../../lib/constants'
import type { RoomId } from '../../types/board'

interface ActivateRoomProps {
  roomId: RoomId | null
  onActivate: () => void
  onCancel: () => void
}

export function ActivateRoom({ roomId, onActivate, onCancel }: ActivateRoomProps) {
  if (!roomId) return null
  const room = ROOMS.find((r) => r.id === roomId)

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onActivate}
        className="px-4 py-2 rounded-lg bg-primary text-white font-body text-sm hover:bg-primary/80 transition-colors"
        aria-label={`Activate ${room?.name} room`}
      >
        Activate {room?.name}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-lg bg-surface text-muted font-body text-sm border border-white/10 hover:text-text transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
