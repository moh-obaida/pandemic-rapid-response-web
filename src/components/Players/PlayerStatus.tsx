import type { Player } from '../../types/game'

interface PlayerStatusProps {
  player: Player
  isCurrentTurn?: boolean
}

export function PlayerStatus({ player, isCurrentTurn }: PlayerStatusProps) {
  const assigned = player.dice.filter((d) => d.assignedRoom).length
  const total = player.dice.length

  return (
    <div className="flex items-center gap-2 text-xs font-body">
      {isCurrentTurn && (
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-label="Your turn" />
      )}
      {player.submitted && (
        <span className="text-success font-medium">Submitted</span>
      )}
      <span className="text-muted">
        Dice: {assigned}/{total}
      </span>
      <span className="text-muted">
        Rerolls: {player.rerollsMax - player.rerollsUsed}
      </span>
    </div>
  )
}
