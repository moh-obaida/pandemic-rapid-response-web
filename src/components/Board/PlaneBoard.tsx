import { RoomTile } from '../ds/RoomTile'
import { SupplyCrate } from '../ds/SupplyCrate'
import { useGameStore } from '../../store/gameStore'
import { getCratesInRoom, getCratesInCargo } from '../../lib/engine/selectors'
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
  const snapshot = useGameStore((s) => s.snapshot)
  const hqTokens = snapshot?.hqTokens ?? 0
  const players = snapshot?.players ?? []

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
        const roomCrates = snapshot ? getCratesInRoom(snapshot, id) : []
        const cargoCrates = id === 'cargo' && snapshot ? getCratesInCargo(snapshot) : []
        const occupants = players.filter((p) => p.position === id).length

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
                  HQ ×{hqTokens}
                </span>
              )}
              {occupants > 0 && (
                <span className="text-xs text-muted">{occupants} player(s)</span>
              )}
              {roomCrates.slice(0, 4).map((s) => (
                <SupplyCrate key={s.id} type={s.type} size={28} />
              ))}
              {cargoCrates.slice(0, 6).map((s) => (
                <SupplyCrate key={s.id} type={s.type} size={28} inCargo />
              ))}
            </RoomTile>
          </div>
        )
      })}
    </div>
  )
}
