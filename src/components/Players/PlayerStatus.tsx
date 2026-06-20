import type { PlayerView } from '../../lib/engine/selectors'

interface PlayerStatusProps {
  player: PlayerView
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  const handCount = player.dice.filter((d) => d.location === 'hand').length
  const assigned = player.dice.filter((d) => d.location === 'room').length

  return (
    <div className="flex items-center gap-2 text-xs font-body">
      {player.isActive && (
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-label="Active turn" />
      )}
      <span className="text-muted capitalize">{player.position}</span>
      <span className="text-muted">
        Dice: {assigned}/{handCount + assigned}
      </span>
      <span className="text-muted">
        Rerolls: {player.rerollsMax - player.rerollsUsed}
      </span>
    </div>
  )
}
