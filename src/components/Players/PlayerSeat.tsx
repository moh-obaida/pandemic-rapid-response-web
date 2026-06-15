import type { Player } from '../../types/game'
import type { Corner } from '../../types/ui'
import { RoleCard } from './RoleCard'
import { DicePool } from './DicePool'
import { PlayerStatus } from './PlayerStatus'

interface PlayerSeatProps {
  player: Player
  corner: Corner
  isSelf?: boolean
  selectedDieId?: string | null
  onDieClick?: (dieId: string) => void
  rolling?: boolean
}

const CORNER_CLASSES: Record<Corner, string> = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-24 left-2',
  'bottom-right': 'bottom-24 right-2',
}

export function PlayerSeat({
  player,
  corner,
  isSelf,
  selectedDieId,
  onDieClick,
  rolling,
}: PlayerSeatProps) {
  return (
    <div
      className={`absolute ${CORNER_CLASSES[corner]} w-[220px] rounded-xl bg-surface border p-3 ${
        isSelf ? 'border-primary/60 shadow-lg shadow-primary/10' : 'border-white/10'
      }`}
      aria-label={`Player ${player.name}${isSelf ? ' (you)' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-bold text-sm text-text truncate">
          {player.name}
          {player.isHost && (
            <span className="ml-1 text-[10px] text-muted">(Host)</span>
          )}
        </span>
        <RoleCard roleId={player.role} compact />
      </div>

      {isSelf && player.dice.length > 0 && (
        <DicePool
          dice={player.dice}
          selectedDieId={selectedDieId}
          onDieClick={onDieClick}
          rolling={rolling}
        />
      )}

      {!isSelf && player.dice.length > 0 && (
        <div className="flex gap-1 justify-center">
          {player.dice.map((d) => (
            <div
              key={d.id}
              className="w-6 h-6 rounded bg-white/10"
              aria-hidden
            />
          ))}
        </div>
      )}

      <div className="mt-2">
        <PlayerStatus player={player} isCurrentTurn={isSelf} />
      </div>
    </div>
  )
}
