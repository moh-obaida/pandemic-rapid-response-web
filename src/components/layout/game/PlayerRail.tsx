import type { Player } from '../../../types/game'
import { MAX_PLAYERS } from '../../../lib/constants'
import { PlayerSeat } from '../../Players/PlayerSeat'

interface PlayerRailProps {
  players: Player[]
  playerId: string | null
  selectedDieId: string | null
  onDieClick: (dieId: string) => void
}

export function PlayerRail({
  players,
  playerId,
  selectedDieId,
  onDieClick,
}: PlayerRailProps) {
  const seated = players.slice(0, MAX_PLAYERS)

  return (
    <>
      {seated.map((player) => (
        <PlayerSeat
          key={player.id}
          player={player}
          isSelf={player.id === playerId}
          selectedDieId={selectedDieId}
          onDieClick={onDieClick}
        />
      ))}
    </>
  )
}
