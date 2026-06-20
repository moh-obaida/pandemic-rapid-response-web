import { ROOMS } from '../../lib/constants'
import type { RoomId } from '../../types/board'

interface RoomSelectorProps {
  selectedDieId: string | null
  selectedRoom: RoomId | null
  onRoomSelect: (roomId: RoomId) => void
}

export function RoomSelector({
  selectedDieId,
  selectedRoom,
  onRoomSelect,
}: RoomSelectorProps) {
  const assignableRooms = ROOMS

  return (
    <div className="flex flex-col gap-1" aria-label="Room selector">
      <span className="text-xs text-muted font-body uppercase tracking-wider">
        {selectedDieId ? 'Assign die to room' : 'Select room to move or assign'}
      </span>
      <div className="flex flex-wrap gap-1">
        {assignableRooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => onRoomSelect(room.id)}
            className={`
              px-2 py-1 rounded text-xs font-body transition-all cursor-pointer hover:brightness-125
              ${selectedRoom === room.id ? 'ring-2 ring-primary' : ''}
            `}
            style={{
              backgroundColor: room.color + '44',
              color: '#fff',
              borderColor: room.color,
              borderWidth: 1,
              borderStyle: 'solid',
            }}
            aria-label={`Assign to ${room.name}`}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  )
}
