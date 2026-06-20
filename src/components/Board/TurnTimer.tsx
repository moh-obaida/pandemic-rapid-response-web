import { useGameStore } from '../../store/gameStore'
import { Timer } from '../ds/Timer'
import { Tooltip } from '../layout/Tooltip'
import { TIMER_SECONDS } from '../../lib/constants/game'

export function TurnTimer() {
  const timer = useGameStore((s) => s.snapshot?.timer ?? TIMER_SECONDS)
  const timerRunning = useGameStore((s) => s.snapshot?.timerRunning ?? false)
  const turnStep = useGameStore((s) => s.snapshot?.turnStep)
  const isFlashing =
    turnStep === 'pausedByTimer' || (timer <= 5 && timerRunning)

  return (
    <Tooltip content="Mission clock runs continuously. On expiry: −1 HQ → crisis (if enabled) → reveal city → same player resumes.">
      <Timer
        seconds={timer}
        total={TIMER_SECONDS}
        size="md"
        label={turnStep === 'pausedByTimer' ? 'Timer Event' : 'Mission Clock'}
        flashing={isFlashing}
      />
    </Tooltip>
  )
}
