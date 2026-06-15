import { ROOMS } from '../../lib/constants'
import type { RoomId } from '../../types/board'
import { X } from 'lucide-react'

interface RoomActivationProps {
  roomId: RoomId
  onConfirm: () => void
  onClose: () => void
}

export function RoomActivation({ roomId, onConfirm, onClose }: RoomActivationProps) {
  const room = ROOMS.find((r) => r.id === roomId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="w-[400px] rounded-xl bg-surface border border-white/10 p-6 shadow-2xl"
        role="dialog"
        aria-label={`Activate ${room?.name}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-text">
            Activate {room?.name}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div
          className="w-full h-2 rounded mb-4"
          style={{ backgroundColor: room?.color }}
        />

        <p className="text-sm text-muted font-body mb-6">
          {room?.supplyType
            ? `Matching dice in ${room.name} will create ${room.name} supply crates.`
            : roomId === 'recycling'
              ? 'Unmatched dice sent here reduce waste by 1 each.'
              : roomId === 'cargo'
                ? 'Move supply crates here to prepare for delivery.'
                : 'HQ stores time tokens for flight operations.'}
        </p>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-body text-muted border border-white/10 hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-body bg-primary text-white hover:bg-primary/80"
          >
            Confirm Activation
          </button>
        </div>
      </div>
    </div>
  )
}
