import type { PlayerView } from '../../lib/engine/selectors'
import { RoleCard } from './RoleCard'
import { DicePool } from './DicePool'
import { PlayerStatus } from './PlayerStatus'

interface PlayerSeatProps {
  player: PlayerView
  isSelf?: boolean
  selectedDieId?: string | null
  onDieClick?: (dieId: string) => void
  rolling?: boolean
}

export function PlayerSeat({
  player,
  isSelf,
  selectedDieId,
  onDieClick,
  rolling,
}: PlayerSeatProps) {
  return (
    <div
      className={`player-seat${isSelf ? ' player-seat--self' : ''}${player.isActive ? ' player-seat--active' : ''}`}
      aria-label={`Player ${player.name}${isSelf ? ' (you)' : ''}`}
    >
      <div className="player-seat__header">
        <span className="player-seat__name">
          {player.name}
          {player.isHost && <span className="player-seat__host">(Host)</span>}
        </span>
        <RoleCard roleId={player.role} compact />
      </div>

      {isSelf && player.dice.length > 0 && (
        <DicePool
          dice={player.dice}
          selectedDieIds={selectedDieId ? [selectedDieId] : []}
          onDieClick={onDieClick ? (id) => onDieClick(id) : undefined}
          rolling={rolling}
          disabled
        />
      )}

      {!isSelf && player.dice.length > 0 && (
        <div className="player-seat__dice-placeholder" aria-hidden>
          {player.dice
            .filter((d) => d.location === 'hand')
            .map((d) => (
              <div key={d.id} className="player-seat__dice-dot" />
            ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/10">
        <PlayerStatus player={player} />
      </div>
    </div>
  )
}
