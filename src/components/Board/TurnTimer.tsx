import { useGameStore } from '../../store/gameStore'
import { Timer } from '../ds/Timer'
import { Tooltip } from '../layout/Tooltip'

export function TurnTimer() {
  const timer = useGameStore((s) => s.gameState.timer)

  return (
    <Tooltip content="When the timer hits 0:00, discard 1 time token or lose if none remain">
      <Timer seconds={timer} total={120} size="md" label="Round Timer" />
    </Tooltip>
  )
}
