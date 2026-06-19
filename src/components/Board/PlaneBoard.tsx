import { RoomTile } from '../ds/RoomTile'
import { SupplyCrate } from '../ds/SupplyCrate'
import { useGameStore } from '../../store/gameStore'
import type { RoomId } from '../../types/board'

const ROOM_LAYOUT: { id: RoomId; grid: string }[] = [
  { id: 'vaccine', grid: 'col-start-1 row-start-1' },
  { id: 'food', grid: 'col-start-2 row-start-1' },
  { id: 'power', grid: 'col-start-3 row-start-1' },
  { id: 'water', grid: 'col-start-1 row-start-2' },
  { id: 'hq', grid: 'col-start-2 row-start-2' },
  { id: 'firstAid', grid: 'col-start-3 row-start-2' },
  { id: 'recycling', grid: 'col-start-1 row-start-3' },
  { id: 'cargo', grid: 'col-start-3 row-start-3' },
]

interface PlaneBoardProps {
  onRoomClick?: (roomId: RoomId) => void
  selectedRoom?: RoomId | null
}

export function PlaneBoard({ onRoomClick, selectedRoom }: PlaneBoardProps) {
  const supplies = useGameStore((s) => s.gameState.supplies)
  const timeTokens = useGameStore((s) => s.gameState.timeTokens)

  return (
    <div
      className="grid grid-cols-3 grid-rows-3 gap-3 p-4"
      style={{
        borderRadius: '16px',
        background: 'var(--bg-800)',
        border: '2px solid var(--line)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
      aria-label="Plane board with 8 rooms"
    >
      {ROOM_LAYOUT.map(({ id, grid }) => {
        const roomSupplies = supplies.filter((s) => s.room === id && !s.inCargo)
        const cargoSupplies = id === 'cargo' ? supplies.filter((s) => s.inCargo) : []

        return (
          <div key={id} className={grid}>
            <RoomTile
              room={id}
              active={selectedRoom === id}
              onClick={() => onRoomClick?.(id)}
            >
              {id === 'hq' && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-dim)',
                  }}
                >
                  ×{timeTokens}
                </span>
              )}
              {roomSupplies.slice(0, 4).map((s) => (
                <SupplyCrate key={s.id} type={s.type} size={28} />
              ))}
              {cargoSupplies.slice(0, 6).map((s) => (
                <SupplyCrate key={s.id} type={s.type} size={28} inCargo />
              ))}
            </RoomTile>
          </div>
        )
      })}
    </div>
  )
}
